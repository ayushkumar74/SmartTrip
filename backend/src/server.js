import http from 'http';
import app from './app.js';
import { env } from './config/env.js';

const server = http.createServer(app);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
