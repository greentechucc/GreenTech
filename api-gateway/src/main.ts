import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  // Habilitar CORS para que el frontend pueda conectarse
  app.enableCors();
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
