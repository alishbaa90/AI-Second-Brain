import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

type SessionMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// Limit to keep the short-term chat window optimized
const MAX_SESSION_MESSAGES = 8;

/**
 * Pushes a new message to the sliding session window in Redis cache.
 */
export async function addToSession(userId: string, projectId: string, message: SessionMessage) {
  const key = `session:${userId}:${projectId}`;
  await redis.rpush(key, JSON.stringify(message));
  await redis.ltrim(key, -MAX_SESSION_MESSAGES, -1);
  await redis.expire(key, 3600);
}

/**
 * Retrieves the full sliding window of cached messages for the current session.
 */
export async function getSession(userId: string, projectId: string): Promise<SessionMessage[]> {
  const key = `session:${userId}:${projectId}`;
  const messages = await redis.lrange(key, 0, -1);
  return messages.map((m) => (typeof m === 'string' ? JSON.parse(m) : m) as SessionMessage);
}