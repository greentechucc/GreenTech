import Redis from 'ioredis';
import { ProjectService } from './project.service';

export const startRedisListener = (projectService: ProjectService) => {
  const redis = new Redis();

  redis.subscribe('prospect.converted');

  redis.on('message', async (channel, message) => {
    const data = JSON.parse(message);

    console.log('Evento recibido:', data);

    await projectService.createProject(data);
  });
};