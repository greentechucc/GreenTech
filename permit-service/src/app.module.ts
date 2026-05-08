import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PermitModule } from './permit/permit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5437'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'permit_db',
      schema: 'permit',
      autoLoadEntities: true,
      synchronize: true, // Development only
      entities: [AuditLog],
    }),
    PermitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
