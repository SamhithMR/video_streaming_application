import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import ChatBox from './ChatBox';
import { Box, Grid, Paper, Typography, Button, TextField, Container, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { User, StreamData, IceCandidate, Message } from '../types/index';
import { getIceServers, getUserMedia } from '../utils/webrtc';
import { styled } from '@mui/material/styles';
import {
  ScreenShare,
  StopScreenShare,
  Settings,
  ExitToApp,
} from '@mui/icons-material';
import VideoGrid from '../components/VideoGrid';
import Chat from '../components/Chat';

interface Props {
  socket: Socket;
}

interface PeerConnection {
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

const RoomContainer = styled(Container)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  gap: theme.spacing(2),
  minHeight: 0, // Important for nested flex containers
}));

const ControlBar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
}));

const VideoRoom: React.FC<Props> = ({ socket }) => {
  const { room_id, username } = useParams();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenStream = useRef<MediaStream | null>(null);
  
  // State Management
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(!username);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [mediaError, setMediaError] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Use refs to avoid dependency cycles
  const peersRef = useRef(new Map<string, PeerConnection>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef(socket);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showChat, setShowChat] = useState(!isMobile);

  const initializeMedia = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(device => device.kind === 'videoinput');
      const hasAudio = devices.some(device => device.kind === 'audioinput');

      if (!hasVideo && !hasAudio) {
        throw new Error('No media devices found');
      }

      try {
        const stream = await getUserMedia();
        setLocalStream(stream);
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
        }
      } catch (mediaError) {
        console.warn('getUserMedia failed, proceeding without media:', mediaError);
        setLocalStream(null);
        localStreamRef.current = null;
      }
    } catch (error) {
      console.error('Media initialization error:', error);
      // Still allow connection without media
      setMediaError(false); // Clear error
      setLocalStream(null);
      localStreamRef.current = null;
    }
  }, []);

  // Add socket connection status tracking
  useEffect(() => {
    console.log('Socket connection status:', socket.connected);
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus('disconnected');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket]);

  const createPeerConnection = useCallback(async (
    peerId: string,
    isInitiator: boolean
  ) => {
    try {
      console.log(`Creating peer connection with ${peerId}, initiator: ${isInitiator}`);
      const peerConnection = new RTCPeerConnection(getIceServers());
      
      // Add local tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      })} else {
        console.warn(`No local media to add to connection with ${peerId}`);
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
          console.log('Sending ICE candidate to', peerId);
          socketRef.current.emit('ice candidates', {
            candidate,
            to: peerId,
            sender: socketRef.current.id,
            room: room_id
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        console.log(`Peer ${peerId} connection state:`, state);
        
        // Handle failed connections
        if (state === 'failed' || state === 'closed') {
          console.log('Connection failed or closed, cleaning up peer:', peerId);
          const updatedPeers = new Map(peersRef.current);
          updatedPeers.delete(peerId);
          peersRef.current = updatedPeers;
          setPeers(updatedPeers);
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log(`Peer ${peerId} ICE connection state:`, peerConnection.iceConnectionState);
      };

      // Handle remote tracks
      peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        const remoteStream = event.streams[0];
        
        if (!remoteStream) {
          console.warn('No remote stream in track event');
          return;
        }

        // Update peers map with the new stream
        const updatedPeers = new Map(peersRef.current);
        updatedPeers.set(peerId, { 
          connection: peerConnection, 
          stream: remoteStream 
        });
        peersRef.current = updatedPeers;
        setPeers(updatedPeers);

        // Set remote stream to video element
        const remoteVideo = document.getElementById(`video-${peerId}`) as HTMLVideoElement;
        if (remoteVideo && remoteStream !== remoteVideo.srcObject) {
          console.log('Setting remote stream to video element');
          remoteVideo.srcObject = remoteStream;
          
          // Handle autoplay
          remoteVideo.play().catch(error => {
            if (error.name === 'NotAllowedError') {
              console.log('Autoplay prevented, waiting for user interaction');
              setNeedsUserInteraction(true);
            }
          });
        }
      };

      // Create and send offer if initiator
      if (isInitiator) {
        console.log('Creating offer as initiator');
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        console.log('Setting local description (offer)');
        await peerConnection.setLocalDescription(offer);
        
        console.log('Sending offer to', peerId);
        socketRef.current.emit('sdp', {
          description: offer,
          to: peerId,
          sender: socketRef.current.id,
          room: room_id
        });
      }

      // Store peer connection in ref and state
      const updatedPeers = new Map(peersRef.current);
      updatedPeers.set(peerId, { connection: peerConnection, stream: null });
      peersRef.current = updatedPeers;
      setPeers(updatedPeers);

      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }, [room_id]);

  const handleSDP = useCallback(async ({ description, sender, to, room }: StreamData) => {
    try {
      console.log('Handling SDP from', sender, description.type);
      let peerConnection = peersRef.current.get(sender)?.connection;
      
      if (!peerConnection) {
        console.log('Creating new peer connection for SDP');
        peerConnection = await createPeerConnection(sender, false);
      }

      if (description.type === 'offer') {
        // For offers, set remote description first
        console.log('Setting remote description (offer)');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
        
        // Then create and set local answer
        console.log('Creating answer');
        const answer = await peerConnection.createAnswer();
        console.log('Setting local description (answer)');
        await peerConnection.setLocalDescription(answer);
        
        // Send answer
        console.log('Sending answer to', sender);
        socketRef.current.emit('sdp', {
          description: answer,
          to: sender,
          sender: socketRef.current.id,
          room: room_id
        });
      } else if (description.type === 'answer') {
        // For answers, just set the remote description
        console.log('Setting remote description (answer)');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
      }
    } catch (error) {
      console.error('Error handling SDP:', error);
    }
  }, [createPeerConnection, room_id]);

  const handleIceCandidate = useCallback(async ({ candidate, sender, to, room }: IceCandidate) => {
    try {
      const peer = peersRef.current.get(sender)?.connection;
      if (!peer) {
        console.warn('No peer connection found for ICE candidate');
        return;
      }

      if (peer.remoteDescription === null) {
        console.warn('Remote description not set, waiting for SDP first');
        return;
      }

      if (candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('Successfully added ICE candidate');
      }
    } catch (error: unknown) {
      // Properly type check the error
      if (error instanceof Error && error.message.includes('Unknown ufrag')) {
        // This is normal when ICE candidates arrive before SDP
        console.log('ICE candidate arrived before SDP, this is normal');
      } else {
        console.error('Error handling ICE candidate:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!room_id || !username) return;

    const setupSocketListeners = () => {
      // Join room
      socketRef.current.emit('subscribe', { 
        room: room_id, 
        socketId: socketRef.current.id,
        username // Add username to help identify peers
      });

      // Handle new user joining
      socketRef.current.on('new user', async ({ socketId }) => {
        console.log('New user joined:', socketId);
        await createPeerConnection(socketId, true);
      });

      // Handle user leaving
      socketRef.current.on('user left', ({ socketId }) => {
        console.log('User left:', socketId);
        const peer = peersRef.current.get(socketId);
        if (peer) {
          peer.connection.close();
          const updatedPeers = new Map(peersRef.current);
          updatedPeers.delete(socketId);
          peersRef.current = updatedPeers;
          setPeers(updatedPeers);
        }
      });

      socketRef.current.on('sdp', handleSDP);
      socketRef.current.on('ice candidates', handleIceCandidate);
    };

    const init = async () => {
      await initializeMedia();
      setupSocketListeners();
    };

    init();

    // Cleanup
    return () => {
      localStreamRef.current?.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      
      peersRef.current.forEach(peer => {
        peer.connection.close();
      });
      peersRef.current.clear();
      setPeers(new Map());
      
      socketRef.current.emit('unsubscribe', { room: room_id, socketId: socketRef.current.id });
      socketRef.current.off('new user');
      socketRef.current.off('user left');
      socketRef.current.off('sdp');
      socketRef.current.off('ice candidates');
    };
  }, [room_id, username, createPeerConnection, handleSDP, handleIceCandidate, initializeMedia]);

  // Media controls
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(prev => !prev);
    }
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(prev => !prev);
    }
  }, [localStream]);

  // Add chat message handler
  const handleNewMessage = useCallback((message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: {
        id: socketRef.current?.id || Date.now().toString(),
        name: username || 'Anonymous',
      },
      content: message,
      timestamp: new Date(),
    };

    // Emit the message to the server
    socketRef.current.emit('chat message', {
      ...newMessage,
      room: room_id,
    });

    // Add message to local state
    setMessages(prev => [...prev, newMessage]);
  }, [room_id, username]);

  // Add chat socket listeners
  useEffect(() => {
    if (!socketRef.current) return;

    const handleIncomingMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    socketRef.current.on('chat message', handleIncomingMessage);

    return () => {
      socketRef.current.off('chat message', handleIncomingMessage);
    };
  }, []);

  // Modify the video controls to only allow toggling own video/audio
  const handleToggleAudio = (participantId: string) => {
    if (participantId === 'local') {
      toggleAudio();
    }
  };

  const handleToggleVideo = (participantId: string) => {
    if (participantId === 'local') {
      toggleVideo();
    }
  };

  // Define proper types for the RemoteVideo component
  interface RemoteVideoProps {
    peerId: string;
    stream: MediaStream | null;
  }

  const RemoteVideo: React.FC<RemoteVideoProps> = ({ peerId, stream }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStream, setHasStream] = useState(false);

    useEffect(() => {
      if (stream) {
        setHasStream(true);
        const video = document.getElementById(`video-${peerId}`) as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
        }
      }
    }, [stream, peerId]);

    const handlePlay = async () => {
      const video = document.getElementById(`video-${peerId}`) as HTMLVideoElement;
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing video:', error);
      }
    };

    return (
      <Paper elevation={3} sx={{ width: 320, height: 240, position: 'relative' }}>
        <video
          id={`video-${peerId}`}
          autoPlay
          playsInline
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            backgroundColor: '#000' 
          }}
        />
        {!hasStream && (
          <Typography
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white'
            }}
          >
            Connecting...
          </Typography>
        )}
        {needsUserInteraction && !isPlaying && hasStream && (
          <Button
            variant="contained"
            onClick={handlePlay}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            Play Video
          </Button>
        )}
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
    );
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

  if (mediaError) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="h6" color="error">
          Unable to access camera or microphone
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setMediaError(false);
            initializeMedia();
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <RoomContainer maxWidth={false} disableGutters>
      <ControlBar elevation={3}>
        <Typography variant="h6">Room: {room_id}</Typography>
      </ControlBar>

      <MainContent>
        <Box sx={{ flex: showChat ? 2 : 1, minHeight: 0 }}>
          <VideoGrid
            participants={[
              {
                id: 'local',
                name: username || 'You',
                isAudioEnabled: isAudioEnabled,
                isVideoEnabled: isVideoEnabled,
                ...(localStream ? { stream: localStream } : {}),
              },
              ...Array.from(peers.entries()).map(([peerId, { stream }]) => ({
                id: peerId,
                name: peerId,
                isAudioEnabled: stream ? stream.getAudioTracks().length > 0 : false,
                isVideoEnabled: stream ? stream.getVideoTracks().length > 0 : false,
                ...(stream ? { stream } : {}),
              })),
            ]}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
          />
        </Box>
        
        <Box 
          sx={{ 
            flex: 1, 
            minHeight: 0, 
            display: { xs: showChat ? 'block' : 'none', md: 'block' },
            minWidth: { md: '300px' },
            maxWidth: { md: '400px' },
          }}
        >
          <Chat
            messages={messages}
            onSendMessage={handleNewMessage}
            currentUserId={socketRef.current?.id || 'local'}
          />
        </Box>
      </MainContent>
    </RoomContainer>
  );
};

export default VideoRoom;
