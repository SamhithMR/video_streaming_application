import { createClient } from 'redis';
import { Message } from '../types';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

const ROOM_MESSAGES_KEY = (roomId: string) => `room:${roomId}:messages`;
const MESSAGE_EXPIRY = 60 * 60 * 24 * 7; 

export const RedisService = {
  async storeMessage(roomId: string, message: Message): Promise<void> {
    try {
      const key = ROOM_MESSAGES_KEY(roomId);
      await redisClient.rPush(key, JSON.stringify(message));
      await redisClient.expire(key, MESSAGE_EXPIRY);
    } catch (error) {
      console.error('Error storing message in Redis:', error);
    }
  },

  async getMessages(roomId: string, limit: number = 50): Promise<Message[]> {
    try {
      const key = ROOM_MESSAGES_KEY(roomId);
      const messages = await redisClient.lRange(key, -limit, -1);
      return messages.map(msg => JSON.parse(msg));
    } catch (error) {
      console.error('Error retrieving messages from Redis:', error);
      return [];
    }
  },

  async clearRoomMessages(roomId: string): Promise<void> {
    try {
      const key = ROOM_MESSAGES_KEY(roomId);
      await redisClient.del(key);
    } catch (error) {
      console.error('Error clearing room messages from Redis:', error);
    }
  }
}; 