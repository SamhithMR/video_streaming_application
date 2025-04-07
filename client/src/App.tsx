import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from "./pages/Home";
import VideoRoom from "./pages/VideoRoom";
import { Socket, io } from 'socket.io-client';

const socket = io('http://localhost:3001/stream');
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
          <Route path="/room/:room_id/:username" element={<VideoRoom socket={socket}/>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
