import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayController } from './gateway/gateway.controller';

@Module({
  imports: [],
  controllers: [AppController, GatewayController],
  providers: [AppService],
})
export class AppModule {}
