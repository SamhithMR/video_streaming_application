import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import ChatBox from './ChatBox';
const VideoRoom: React.FC = () => {
  const { room_id, username } = useParams();
  const socketRef = useRef<Socket | null>(null);
  const [isSocketReady, setIsSocketReady] = useState(false);

  useEffect(() => {
    if (!room_id || !username) return;

    const socket = io('http://localhost:3001/stream', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe', {
        room: room_id,
        socketId: socket.id,
      });
      setIsSocketReady(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [room_id, username]);

  return (
    <div>
      <h3>Room: {room_id} | User: {username}</h3>
      <div className="video-container">
        {/* Video elements go here */}
      </div>
      <div className="chat-container">
        {isSocketReady && socketRef.current && (
          <ChatBox
            socket={socketRef.current}
            userName={username!}
            room={room_id ?? ''}
          />
        )}
      </div>
    </div>
  );
};


export default VideoRoom;
