// WebSocket service for real-time communication
class WebSocketService {
  constructor() {
    this.socket = null;
    this.handlers = new Map();
    this.connected = false;
  }

  // Connect to the WebSocket server
  connect() {
    if (this.socket && this.connected) return;

    // For development, connect directly to port 3000
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname;
    const port = process.env.NODE_ENV === 'production' ? window.location.port : '3000';

    const url = `${protocol}://${host}:${port}`;
    console.log(`Connecting to WebSocket at: ${url}`);

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.connected = true;
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket connection closed with code: ${event.code}, reason: ${event.reason}`);
      this.connected = false;

      // Try to reconnect after a delay
      setTimeout(() => this.connect(), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connected = false;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  // Handle incoming messages and dispatch to registered handlers
  handleMessage(data) {
    // Call all handlers with the message data
    this.handlers.forEach((handler) => {
      handler(data);
    });
  }

  // Register a handler function to process incoming messages
  registerHandler(id, handler) {
    this.handlers.set(id, handler);
    return () => this.handlers.delete(id); // Return function to unregister
  }

  // Send a message to the server
  sendMessage(data) {
    if (this.socket && this.connected) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }

  // Close the connection
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;