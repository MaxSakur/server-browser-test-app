self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
    
    // WebSocket соединение вместо Fetch для long polling
    let socket = new WebSocket('wss://test-log-viewer-backend.stg.onepunch.agency/view-log-ws');
    
    socket.onmessage = event => {
      // Предполагается, что данные приходят в формате JSON
      const data = JSON.parse(event.data);
      
      // Отправляем данные всем клиентам (страницам), контролируемым service worker
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage(data);
        });
      });
    };
    
    socket.onerror = error => {
      console.error('WebSocket Error:', error);
    };
    
    // Переподключение при случайном отключении
    socket.onclose = () => {
      // Подключаемся снова через некоторое время
      setTimeout(() => {
        socket = new WebSocket('wss://test-log-viewer-backend.stg.onepunch.agency/view-log-ws');
      }, 5000);
    };
  });
  