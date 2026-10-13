import { io } from 'socket.io-client';

// Connect to WebSocket server (supports environment variable for cloud deployment, fallback to local)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  ? import.meta.env.VITE_SOCKET_URL.replace(/\/$/, '')
  : (window.location.port === '3000' ? 'http://localhost:5000' : window.location.origin);


export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
  console.log('[Socket Client] Connected with ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('[Socket Client] Disconnected from server');
});
