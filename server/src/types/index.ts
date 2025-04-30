export interface User {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  room: string;
}

export interface StreamData {
  description: RTCSessionDescription;
  sender: string;
  to: string;
  room: string;
}

export interface IceCandidate {
  candidate: RTCIceCandidate;
  sender: string;
  to: string;
  room: string;
} 