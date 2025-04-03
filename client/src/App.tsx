import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import VideoRoom from "./pages/VideoRoom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:room_id/:username" element={<VideoRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
