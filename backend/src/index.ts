import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointment';
import recordRoutes from './routes/record';
import aiRoutes from './routes/ai';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('DocDost API is running');
});

// SERVER
const server = http.createServer(app);

// SOCKET
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log("User connected:", socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected');
  });

  // 🔥 VIDEO SIGNALING
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data.offer);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data.answer);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data.candidate);
  });

  // 🔥 CHAT
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data.message);
  });

  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});