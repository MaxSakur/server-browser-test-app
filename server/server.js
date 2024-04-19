const WebSocket = require('ws');
const fs = require('fs');
const readline = require('readline');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    const rl = readline.createInterface({
        input: fs.createReadStream('./build.log'),
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        if (ws.readyState === WebSocket.OPEN) {
            setTimeout(() => {
                ws.send(line, (error) => {
                    if (error) {
                        console.error('Failed to send message:', error);
                    }
                });
            }, 1000); // Задержка в 1000 мс (1 секунда) между сообщениями
        }
    });

    rl.on('close', () => {
        console.log('Finished reading file');
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
