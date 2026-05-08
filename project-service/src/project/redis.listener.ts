import Redis from 'ioredis';
import { ProjectService } from './project.service';

export const startRedisListener = (projectService: ProjectService) => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, retryStrategy: () => null });

    redis.on('error', () => {
      console.warn('[RedisListener] Redis not available, skipping pub/sub listener');
    });

    redis.subscribe('prospect.converted');

    redis.on('message', async (channel, message) => {
      const data = JSON.parse(message);
      console.log('Evento recibido:', data);
      // await projectService.createProject(data);
    });
  } catch {
    console.warn('[RedisListener] Redis not available, running without pub/sub');
  }
};