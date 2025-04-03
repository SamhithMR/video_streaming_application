import React, { useEffect, useRef, useState } from 'react';
import { Box, TextField, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Socket } from 'socket.io-client';

interface Props {
  socket: Socket;
  userName: string;
  room: string;
}

interface Message {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
  room: String;
}

const ChatBox: React.FC<Props> = ({ socket, userName, room }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    socket.on('chat', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('chat');
    };
  }, [socket]);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        userName,
        text: input.trim(),
        timestamp: new Date().toISOString(),
        room: room,
      };
      socket.emit('chat', newMessage);
      setMessages((prev) => [...prev, newMessage]);
      setInput('');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          mb: 1,
          backgroundColor: '#f5f5f5',
        }}
      >
        <List>
          {messages.map((msg) => (
            <ListItem
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.userName === userName ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  bgcolor: msg.userName === userName ? '#dcf8c6' : '#fff',
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: '60%',
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1">{msg.text}</Typography>
                  }
                  secondary={
                    <Typography variant="caption" align="right" sx={{ display: 'block' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  }
                />
                <ListItemText
                  secondary={
                    <Typography variant="caption" align="right" sx={{ display: 'block' }}>
                      {msg.userName}
                    </Typography>
                  }
                />
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <TextField
        fullWidth
        placeholder="Type your message..."
        variant="outlined"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
      />
    </Box>
  );
};

export default ChatBox;