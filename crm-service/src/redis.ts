import Redis from 'ioredis';

let redisInstance: Redis | null = null;

try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redisInstance = new Redis(redisUrl, { maxRetriesPerRequest: 1, retryStrategy: () => null });
  redisInstance.on('error', () => {
    console.warn('[CRM] Redis not available, running without pub/sub');
    redisInstance = null;
  });
} catch {
  console.warn('[CRM] Redis not available, running without pub/sub');
  redisInstance = null;
}

export const redis = redisInstance;