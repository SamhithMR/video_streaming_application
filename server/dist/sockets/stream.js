"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStreamNamespace = void 0;
// Keep track of users in rooms
const rooms = new Map();
const registerStreamNamespace = (stream) => {
    stream.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        socket.on('subscribe', (data) => {
            // Join the room
            socket.join(data.room);
            socket.join(data.socketId);
            // Add user to room tracking
            if (!rooms.has(data.room)) {
                rooms.set(data.room, new Set());
            }
            rooms.get(data.room)?.add({ socketId: data.socketId, username: data.username });
            // Notify others in the room
            socket.to(data.room).emit('new user', {
                socketId: data.socketId,
                username: data.username
            });
            console.log(`User ${data.username} (${data.socketId}) joined room: ${data.room}`);
        });
        socket.on('sdp', (data) => {
            console.log(`SDP: ${data.description.type} from ${data.sender} to ${data.to}`);
            socket.to(data.to).emit('sdp', {
                description: data.description,
                sender: data.sender
            });
        });
        socket.on('ice candidates', (data) => {
            console.log(`ICE candidate from ${data.sender} to ${data.to}`);
            socket.to(data.to).emit('ice candidates', {
                candidate: data.candidate,
                sender: data.sender
            });
        });
        socket.on('chat message', (message) => {
            console.log(`Chat message from ${message.sender.name} in room ${message.room}: ${message.content}`);
            // Broadcast the message to all users in the room except the sender
            socket.to(message.room).emit('chat message', message);
        });
        socket.on('unsubscribe', (data) => {
            handleUserDisconnection(socket, data.room, data.socketId);
        });
        socket.on('disconnect', () => {
            // Find and remove user from all rooms they were in
            rooms.forEach((users, room) => {
                const user = Array.from(users).find(u => u.socketId === socket.id);
                if (user) {
                    handleUserDisconnection(socket, room, socket.id);
                }
            });
        });
    });
    const handleUserDisconnection = (socket, room, socketId) => {
        const roomUsers = rooms.get(room);
        if (roomUsers) {
            // Remove user from room tracking
            roomUsers.forEach(user => {
                if (user.socketId === socketId) {
                    roomUsers.delete(user);
                }
            });
            // If room is empty, remove it
            if (roomUsers.size === 0) {
                rooms.delete(room);
            }
            // Notify others in the room
            socket.to(room).emit('user left', { socketId });
            console.log(`User ${socketId} left room: ${room}`);
        }
    };
};
exports.registerStreamNamespace = registerStreamNamespace;
