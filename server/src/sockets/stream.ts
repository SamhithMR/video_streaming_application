import { Namespace, Socket } from 'socket.io';

interface StreamData {
  description: RTCSessionDescription;
  sender: string;
  to: string;
}

interface IceCandidate {
  candidate: RTCIceCandidate;
  sender: string;
  to: string;
}

interface ChatMessage {
  sender: string;
  msg: string;
  timestamp: string;
  room: string;
}

export const registerStreamNamespace = (stream: Namespace) => {
  stream.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('subscribe', (data: { room: string; socketId: string }) => {
      socket.join(data.room);
      socket.join(data.socketId);
      socket.to(data.room).emit('new user', { socketId: data.socketId });
    });

    socket.on('newUserStart', (data: { to: string; sender: string }) => {
      socket.to(data.to).emit('newUserStart', { sender: data.sender });
    });

    socket.on('sdp', (data: StreamData) => {
      socket.to(data.to).emit('sdp', {
        description: data.description,
        sender: data.sender
      });
    });

    socket.on('ice candidates', (data: IceCandidate) => {
      socket.to(data.to).emit('ice candidates', {
        candidate: data.candidate,
        sender: data.sender
      });
    });

    socket.on('chat', (data: ChatMessage) => {
      socket.to(data.room).emit('chat', data);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
