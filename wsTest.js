const { WebSocketServer } = require('ws');

const PORT = 5000;

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});

wss.on('connection', (ws, req) => {
  console.log('Client connected:', req && req.socket && req.socket.remoteAddress);

  // Send an initial random 8-bit integer (0-255) as a single byte
  const initial = Math.floor(Math.random() * 256);
  // ws.send(Buffer.from([initial]));
  // console.log('Sent initial 8-bit integer:', initial);

  ws.on('message', (message) => {
    let value;
    if (Buffer.isBuffer(message)) {
      value = message[0];
    } else {
      // if it's a string, try to parse an integer
      const parsed = parseInt(message.toString(), 10);
      if (Number.isNaN(parsed)) {
        console.log('Received non-integer message:', message.toString());
        return;
      }
      value = parsed & 0xff;
    }

    console.log('Received 8-bit integer from client:', value);

    // Echo back the same single-byte integer
    // ws.send(Buffer.from([value]));
    // console.log('Echoed back:', value);
  });

  ws.on('close', (code, reason) => {
    console.log('Client disconnected', code, reason && reason.toString());
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Graceful shutdown on SIGINT
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  wss.close(() => process.exit(0));
});
