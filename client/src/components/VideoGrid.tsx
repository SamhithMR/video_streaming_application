import React from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MicOff, Mic, VideocamOff, Videocam } from '@mui/icons-material';
import { Participant } from '../types';

interface VideoGridProps {
  participants: Participant[];
  onToggleAudio: (participantId: string) => void;
  onToggleVideo: (participantId: string) => void;
}

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
}));

const VideoContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.grey[900],
  aspectRatio: '16/9',
  overflow: 'hidden',
  borderRadius: theme.spacing(1),
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const ParticipantControls = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  left: theme.spacing(1),
  right: theme.spacing(1),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.5),
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: theme.spacing(1),
}));

const VideoGrid: React.FC<VideoGridProps> = ({ participants, onToggleAudio, onToggleVideo }) => {
  return (
    <GridContainer>
      {participants.map((participant) => (
        <Box key={participant.id}>
          <VideoContainer elevation={3}>
            {participant.stream && participant.isVideoEnabled ? (
              <video
                autoPlay
                playsInline
                muted={participant.id === 'local'}
                ref={(element) => {
                  if (element && participant.stream) {
                    element.srcObject = participant.stream;
                  }
                }}
              />
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Typography variant="h6" color="white">
                  Camera Off
                </Typography>
              </div>
            )}
            <ParticipantControls>
              <Typography variant="body1" color="white">
                {participant.name}
              </Typography>
              {participant.id === 'local' && (
                <div>
                  <IconButton
                    size="small"
                    onClick={() => onToggleAudio(participant.id)}
                    sx={{ color: 'white', mr: 1 }}
                  >
                    {participant.isAudioEnabled ? <Mic /> : <MicOff />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onToggleVideo(participant.id)}
                    sx={{ color: 'white' }}
                  >
                    {participant.isVideoEnabled ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                </div>
              )}
            </ParticipantControls>
          </VideoContainer>
        </Box>
      ))}
    </GridContainer>
  );
};

export default VideoGrid; 