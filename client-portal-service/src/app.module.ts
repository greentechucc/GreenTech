import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortalModule } from './portal/portal.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5439,
      username: 'postgres',
      password: 'postgres',
      database: 'client_portal_db',
      autoLoadEntities: true,
      synchronize: true, // Dev only
    }),
    PortalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
