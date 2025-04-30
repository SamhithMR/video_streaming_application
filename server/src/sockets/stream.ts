import { Namespace, Socket } from 'socket.io';
import { RedisService } from '../services/redis';
import { Message, StreamData, IceCandidate } from '../types';

interface User {
  id: string;
  name: string;
}

interface RoomUser {
  socketId: string;
  username: string;
}

const rooms = new Map<string, Set<RoomUser>>();

export const registerStreamNamespace = (stream: Namespace) => {
  stream.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('subscribe', async (data: { room: string; socketId: string; username: string }) => {
      socket.join(data.room);
      socket.join(data.socketId);
      
      if (!rooms.has(data.room)) {
        rooms.set(data.room, new Set());
      }
      rooms.get(data.room)?.add({ socketId: data.socketId, username: data.username });
      
      socket.to(data.room).emit('new user', { 
        socketId: data.socketId,
        username: data.username 
      });

      const previousMessages = await RedisService.getMessages(data.room);
      socket.emit('previous messages', previousMessages);

      console.log(`User ${data.username} (${data.socketId}) joined room: ${data.room}`);
    });

    socket.on('sdp', (data: StreamData) => {
      console.log(`SDP: ${data.description.type} from ${data.sender} to ${data.to}`);
      socket.to(data.to).emit('sdp', {
        description: data.description,
        sender: data.sender
      });
    });

    socket.on('ice candidates', (data: IceCandidate) => {
      console.log(`ICE candidate from ${data.sender} to ${data.to}`);
      socket.to(data.to).emit('ice candidates', {
        candidate: data.candidate,
        sender: data.sender
      });
    });

    socket.on('chat message', async (message: Message) => {
      console.log(`Chat message from ${message.sender.name} in room ${message.room}: ${message.content}`);
      
      await RedisService.storeMessage(message.room, message);
      
      socket.to(message.room).emit('chat message', message);
    });

    socket.on('unsubscribe', (data: { room: string; socketId: string }) => {
      handleUserDisconnection(socket, data.room, data.socketId);
    });

    socket.on('disconnect', () => {
      rooms.forEach((users, room) => {
        const user = Array.from(users).find(u => u.socketId === socket.id);
        if (user) {
          handleUserDisconnection(socket, room, socket.id);
        }
      });
    });
  });

  const handleUserDisconnection = (socket: Socket, room: string, socketId: string) => {
    const roomUsers = rooms.get(room);
    if (roomUsers) {
      roomUsers.forEach(user => {
        if (user.socketId === socketId) {
          roomUsers.delete(user);
        }
      });
      
      if (roomUsers.size === 0) {
        rooms.delete(room);
      }
      
      socket.to(room).emit('user left', { socketId });
      console.log(`User ${socketId} left room: ${room}`);
    }
  };
};
