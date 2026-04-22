import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { Telemetry } from './telemetry.entity';
import { Inverter } from './inverter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Telemetry, Inverter])],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}
