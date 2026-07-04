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
export async function addToSession(projectId: string, message: SessionMessage) {
  const key = `session:${projectId}`;

  // Append the new message to the list
  await redis.rpush(key, JSON.stringify(message));

  // Trim the list to retain only the last N messages; older records are discarded automatically
  await redis.ltrim(key, -MAX_SESSION_MESSAGES, -1);

  // Set the session memory lifespan to expire in 1 hour if the user becomes inactive
  await redis.expire(key, 3600);
}

/**
 * Retrieves the full sliding window of cached messages for the current session.
 */
export async function getSession(projectId: string): Promise<SessionMessage[]> {
  const key = `session:${projectId}`;
  const messages = await redis.lrange(key, 0, -1);

  return messages.map((m) => {
    if (typeof m === 'string') {
      return JSON.parse(m) as SessionMessage;
    }
    return m as SessionMessage;
  });
}