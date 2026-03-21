"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const auth_1 = __importDefault(require("./routes/auth"));
const appointment_1 = __importDefault(require("./routes/appointment"));
const record_1 = __importDefault(require("./routes/record"));
const ai_1 = __importDefault(require("./routes/ai"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ROUTES
app.use('/api/auth', auth_1.default);
app.use('/api/appointments', appointment_1.default);
app.use('/api/records', record_1.default);
app.use('/api/ai', ai_1.default);
app.get('/', (req, res) => {
    res.send('DocDost API is running');
});
// 🔥 CREATE SERVER
const server = http_1.default.createServer(app);
// 🔥 SOCKET.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log("User connected:", socket.id);
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    });
    socket.on('offer', (data) => {
        socket.to(data.roomId).emit('offer', data);
    });
    socket.on('answer', (data) => {
        socket.to(data.roomId).emit('answer', data);
    });
    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', data);
    });
    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);
    });
});
// 🔥 START SERVER
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=index.js.map