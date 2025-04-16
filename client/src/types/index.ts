export interface User {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
}

export interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
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

export interface ChatMessage {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  room: string;
}

export interface RoomState {
  participants: Participant[];
  messages: ChatMessage[];
  isScreenSharing: boolean;
  roomId: string;
} 