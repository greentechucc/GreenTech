import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

export const redis: Redis | null = redisUrl ? new Redis(redisUrl) : null;

if (!redisUrl) {
  console.warn('[CRM] REDIS_URL not set, running without pub/sub');
}