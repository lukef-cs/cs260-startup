const { WebSocketServer } = require('ws');

// Store connected clients
const connectedClients = new Set();

function setupWebSocketServer(httpServer) {
  // Create a WebSocket server by passing the HTTP server
  const wss = new WebSocketServer({ server: httpServer });

  // Set up connection handling
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    connectedClients.add(ws);

    // Set initial alive status
    ws.isAlive = true;

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        // Parse the incoming message
        const data = JSON.parse(message);
        console.log('Received message:', data);

        // Broadcast the message to all connected clients
        broadcastMessage(data, ws);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // Handle connection closing
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      connectedClients.delete(ws);
    });

    // Handle pong messages to keep connection alive
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Setup interval to check for dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        connectedClients.delete(ws);
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // Check every 30 seconds

  // Clean up interval on server close
  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

// Broadcast a message to all clients except the sender
function broadcastMessage(data, sender) {
  connectedClients.forEach((client) => {
    // Don't send the message back to the sender
    if (client !== sender && client.readyState === 1) { // 1 = WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// Function to send a message to all connected clients
function sendToAll(data) {
  const message = JSON.stringify(data);
  connectedClients.forEach((client) => {
    if (client.readyState === 1) { // 1 = WebSocket.OPEN
      client.send(message);
    }
  });
}

module.exports = {
  setupWebSocketServer,
  sendToAll
};