"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStreamNamespace = void 0;
const registerStreamNamespace = (stream) => {
    stream.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        socket.on('subscribe', (data) => {
            socket.join(data.room);
            socket.join(data.socketId);
            console.log("socket joined room:", data.room);
            socket.to(data.room).emit('new user', { socketId: data.socketId });
        });
        socket.on('newUserStart', (data) => {
            socket.to(data.to).emit('newUserStart', { sender: data.sender });
        });
        socket.on('sdp', (data) => {
            socket.to(data.to).emit('sdp', {
                description: data.description,
                sender: data.sender
            });
        });
        socket.on('ice candidates', (data) => {
            socket.to(data.to).emit('ice candidates', {
                candidate: data.candidate,
                sender: data.sender
            });
        });
        socket.on('chat', (data) => {
            console.log(`Chat message from ${data.userName} in room ${data.room}: ${data.text}`);
            socket.to(data.room).emit('chat', data);
        });
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};
exports.registerStreamNamespace = registerStreamNamespace;
