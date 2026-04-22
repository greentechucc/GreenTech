import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProjectService } from './project/project.service';
import { startRedisListener } from './project/redis.listener';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const projectService = app.get(ProjectService);
  startRedisListener(projectService);

  await app.listen(3003);
}
bootstrap();
