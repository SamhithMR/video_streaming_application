import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import ChatBox from './ChatBox';
import { Box, Grid, Paper, Typography, Button, TextField } from '@mui/material';
import { User, StreamData, IceCandidate } from '../types/index';
import { getIceServers, getUserMedia } from '../utils/webrtc';
import { Videocam, VideocamOff, Mic, MicOff, ScreenShare, StopScreenShare, FiberManualRecord, Chat } from '@mui/icons-material';

interface Props {
  socket: Socket;
}

const VideoRoom: React.FC<Props> = ({ socket }) => {
  const { room_id, username } = useParams();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenStream = useRef<MediaStream | null>(null);

  // Media and Stream States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Peer connections and chat state
  const [peers, setPeers] = useState<{ [key: string]: RTCPeerConnection }>({});
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [usernameInput, setUsernameInput] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(!username);


  useEffect(() => {
    if (!room_id) return;
    if (!username) {
      setShowUsernamePrompt(true);
      return;
    }

    initializeMedia();
    console.log("in usereffec")
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, [room_id, username, socket]);


  const initializeMedia = async () => {
    try {
      const stream = await getUserMedia();
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const setupSocketListeners = () => {
    socket.on('connect', () => {
      console.log("connec", { room: room_id, socketId: socket.id })
      socket.emit('subscribe', { room: room_id, socketId: socket.id });
    });
    socket.on('new user', ({ socketId }) => {
      console.log(`New user joined: ${socketId}`);
      createPeerConnection(socketId, true)
    });
    socket.on('sdp', handleSDP);
    socket.on('ice candidates', handleIceCandidates);

    socket.on('connect_error', (err) => {
        console.error('Socket connection failed:', err);
    });

  };

  const cleanupSocketListeners = () => {
    socket.off('new user');
    socket.off('sdp');
    socket.off('ice candidates');
    // socket.disconnect();
  };

  const createPeerConnection = async (peerId: string, isInitiator: boolean) => {
    const peer = new RTCPeerConnection(getIceServers());
    peers[peerId] = peer;
    setPeers((prev) => ({ ...prev, [peerId]: peer }));

    peer.onicecandidate = ({ candidate }) => {
      socket.emit('ice candidates', {
        candidate,
        to: peerId,
        sender: socket.id,
      });
    };

    peer.ontrack = (event) => {
      const remoteVideo = document.getElementById(`video-${peerId}`) as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));
    }

    if (isInitiator) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('sdp', {
        description: peer.localDescription,
        to: peerId,
        sender: socket.id,
      });
    }

    return peer;
  };

  const handleSDP = async ({ description, sender }: StreamData) => {
    const peer = peers[sender] || await createPeerConnection(sender, false);
    await peer.setRemoteDescription(description);

    if (description.type === 'offer') {
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('sdp', {
        description: peer.localDescription,
        to: sender,
        sender: socket.id,
      });
    }
  };

  const handleIceCandidates = async ({ candidate, sender }: IceCandidate) => {
    if (candidate) {
      await peers[sender]?.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  if (showUsernamePrompt) {
    return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        padding: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          backgroundColor: 'background.paper',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'primary.main',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Enter Your Username
        </Typography>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            if (usernameInput.trim()) {
              window.location.href = `/room/${room_id}/${encodeURIComponent(usernameInput.trim())}`;
            }
          }}
        >
          Continue
        </Button>
      </Box>
    </Box>
    );
  }

  return (
    
    <div>
      <h3>Room: {room_id} | User: {username}</h3>
      <div className="video-container">
        <Box sx={{ height: '100vh', p: 2 }}>
          <Grid container spacing={2}>
            <Grid sx={{ gridColumn: `span ${isChatOpen ? 9 : 12}` }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Local Video */}
                <Paper elevation={3} sx={{ width: 320, height: 240, position: 'relative' }}>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      padding: '2px 6px',
                      borderRadius: 1,
                    }}
                  >
                    You
                  </Typography>
                </Paper>
  
                {/* Remote Peers */}
                {Object.keys(peers).map((peerId) => (
                  <Paper key={peerId} elevation={3} sx={{ width: 320, height: 240, position: 'relative' }}>
                    <video
                      id={`video-${peerId}`}
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        color: 'white',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: '2px 6px',
                        borderRadius: 1,
                      }}
                    >
                      Participant
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
  
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 2,
              padding: 1,
            }}
          >
            {/* Buttons for video/audio controls can go here */}
          </Box>
        </Box>
      </div>
  
      {/* Chat Container */}
      <div className="chat-container">
        {socket && (
          <ChatBox
            socket={socket}
            userName={username!}
            room={room_id ?? ''}
          />
        )}
      </div>
    </div>
  );

};

export default VideoRoom;
