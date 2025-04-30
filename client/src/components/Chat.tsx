import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  TextField,
  IconButton,
  Typography,
  Box,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
  };
  content: string;
  timestamp: Date;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
  isLoading?: boolean;
}

const ChatContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '3px',
  },
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser',
})<{ isCurrentUser: boolean }>(({ theme, isCurrentUser }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  flexDirection: isCurrentUser ? 'row-reverse' : 'row',
}));

const MessageContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser',
})<{ isCurrentUser: boolean }>(({ theme, isCurrentUser }) => ({
  backgroundColor: isCurrentUser ? theme.palette.primary.main : theme.palette.grey[100],
  color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  maxWidth: '70%',
  wordBreak: 'break-word',
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentUserId, isLoading = false }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <ChatContainer elevation={3}>
      <Box p={2} borderBottom={1} borderColor="divider">
        <Typography variant="h6">Chat</Typography>
      </Box>
      
      <MessagesContainer>
        {isLoading ? (
          <LoadingContainer>
            <CircularProgress size={24} />
          </LoadingContainer>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                isCurrentUser={message.sender.id === currentUserId}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: message.sender.id === currentUserId ? 'primary.main' : 'secondary.main',
                  }}
                >
                  {message.sender.name[0].toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender.id === currentUserId ? 'flex-end' : 'flex-start',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {message.sender.name}
                    </Typography>
                  </Box>
                  <MessageContent isCurrentUser={message.sender.id === currentUserId}>
                    <Typography variant="body1" color={message.sender.id !== currentUserId ? 'black' : 'primary.contrastText'}>
                      {message.content}
                    </Typography>
                    <Typography variant="caption" color={message.sender.id === currentUserId ? 'primary.contrastText' : 'text.secondary'}>
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  </MessageContent>
                </Box>
              </MessageBubble>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>

      <InputContainer>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          size="small"
          variant="outlined"
          disabled={isLoading}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!newMessage.trim() || isLoading}
        >
          <Send />
        </IconButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat; 