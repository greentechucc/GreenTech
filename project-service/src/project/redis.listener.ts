import Redis from 'ioredis';
import { ProjectService } from './project.service';

export const startRedisListener = (projectService: ProjectService) => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('[RedisListener] REDIS_URL not set, skipping pub/sub listener');
    return;
  }

  const redis = new Redis(redisUrl);

  redis.subscribe('prospect.converted');

  redis.on('message', async (channel, message) => {
    const data = JSON.parse(message);
    console.log('Evento recibido:', data);
    // await projectService.createProject(data);
  });
};