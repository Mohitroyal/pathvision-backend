const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Globalize IO for use in services
global.io = io;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`PathVision OS Backend Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});
