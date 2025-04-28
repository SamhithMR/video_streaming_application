import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from "./pages/Home";
import VideoRoom from "./pages/VideoRoom";
import { Socket, io } from 'socket.io-client';

const SOCKET_URL = `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_SOCKET_NAMESPACE}` || 'http://localhost:3001/stream';
console.log('connecing to socket url', SOCKET_URL)
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
  withCredentials: true
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:room_id/:username?" element={<VideoRoom socket={socket}/>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
