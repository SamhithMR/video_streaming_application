import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { registerStreamNamespace } from './sockets/stream';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL || 'https://your-app-name.up.railway.app'
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server is running.");
  });
}

const stream = io.of('/stream');
registerStreamNamespace(stream);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
