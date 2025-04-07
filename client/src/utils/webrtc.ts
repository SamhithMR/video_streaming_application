export const getIceServers = () => ({
  iceServers: [
    {
      urls: ["stun:eu-turn4.xirsys.com"]
    },
    {
      username: "ml0jh0qMKZKd9P_9C0UIBY2G0nSQMCFBUXGlk6IXDJf8G2uiCymg9WwbEJTMwVeiAAAAAF2__hNSaW5vbGVl",
      credential: "4dd454a6-feee-11e9-b185-6adcafebbb45",
      urls: [
        "turn:eu-turn4.xirsys.com:80?transport=udp",
        "turn:eu-turn4.xirsys.com:3478?transport=tcp"
      ]
    }
  ]
});

export const getUserMedia = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    });
  } catch (error) {
    throw new Error('User media not available');
  }
};

export const getDisplayMedia = async () => {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });
  } catch (error) {
    throw new Error('Screen sharing not available');
  }
};

export const replaceTrack = (stream: MediaStreamTrack, recipientPeer: RTCPeerConnection) => {
  const sender = recipientPeer.getSenders().find(s => s.track && s.track.kind === stream.kind);
  if (sender) {
    sender.replaceTrack(stream);
  }
}; 