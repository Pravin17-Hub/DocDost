import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointment';
import recordRoutes from './routes/record';
import aiRoutes from './routes/ai';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('DocDost API is running');
});

import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
  });

  // 🔥 VIDEO CALL SIGNALING

  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  // OPTIONAL CHAT
  socket.on('message', (data) => {
    io.to(data.roomId).emit('createMessage', data.message);
  });

  socket.on('disconnect', () => {
    console.log("User disconnected");
  });

});
