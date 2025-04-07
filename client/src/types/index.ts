export interface User {
  socketId: string;
  username: string;
  room: string;
}

export interface ChatMessage {
  sender: string;
  msg: string;
  timestamp: string;
  room: string;
}

export interface StreamData {
  description: RTCSessionDescription;
  sender: string;
  to: string;
}

export interface IceCandidate {
  candidate: RTCIceCandidate;
  sender: string;
  to: string;
} 