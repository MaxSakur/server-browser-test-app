const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 8080 });
const DELAY = 500; 
const logFilePath = path.join(__dirname, 'build.log');

const countFileLines = filePath => new Promise((resolve, reject) => {
  let lineCount = 0;
  const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  let leftover = '';
  
  stream.on('data', data => {
    leftover += data;
    const lines = leftover.split(/\r?\n/);
    leftover = lines.pop();
    lineCount += lines.length;
  });

  stream.on('end', () => {
    if (leftover.length > 0) lineCount++;
    resolve(lineCount);
  });

  stream.on('error', err => {
    console.error(`Error reading file: ${err.message}`);
    reject(err);
  });
});

wss.on('connection', async ws => {
  try {
    ws.send(JSON.stringify({ message: "Preparing to send data", progress: 0 }));

    const totalLines = await countFileLines(logFilePath);
    if (totalLines === 0) {
      ws.close();
      return;
    }

    const readStream = fs.createReadStream(logFilePath, { encoding: 'utf-8' });
    let currentLine = 0;
    let leftover = '';
    const linesToSend = [];

    const sendNextLine = () => {
      if (linesToSend.length > 0) {
        const { line, progress } = linesToSend.shift();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ message: line, progress }));
          setTimeout(sendNextLine, DELAY);
        }
      }
    };

    readStream.on('data', data => {
      leftover += data;
      const lines = leftover.split(/\r?\n/);
      leftover = lines.pop();
      lines.forEach(line => {
        currentLine++;
        const progress = Math.round((currentLine / totalLines) * 100);
        linesToSend.push({ line, progress });
      });
    });

    readStream.on('end', () => {
      if (leftover.length > 0) {
        currentLine++;
        linesToSend.push({ line: leftover, progress: 100 });
      }
      linesToSend.push({ line: 'End of file.', progress: 100 });
      sendNextLine();
    });

    readStream.on('error', err => {
      console.error(`Error reading file: ${err.message}`);
      ws.close();
    });

    ws.on('close', () => {
      readStream.destroy();
    });

    sendNextLine();
  } catch (err) {
    console.error(`Failed to process file: ${err.message}`);
    ws.close();
  }
});

console.log('Server is running on ws://localhost:8080');
