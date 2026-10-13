const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/apiRoutes');
const { setupSocketIO } = require('./services/socketHandler');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(u => u.trim()) : '*';

// Enable CORS and body parsing
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create HTTP and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});


// Attach io to express app context for controller access
app.set('io', io);
setupSocketIO(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'ResQNet Dispatch Engine',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ResQNet Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` ResQNet Emergency Dispatch Server is active on port ${PORT}`);
  console.log(` REST API: http://localhost:${PORT}/api/incidents`);
  console.log(` WebSocket: ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});
