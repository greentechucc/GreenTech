import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PermitModule } from './permit/permit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5437,
      username: 'postgres',
      password: 'postgres',
      database: 'permit_db',
      autoLoadEntities: true,
      synchronize: true, // Development only
    }),
    PermitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
