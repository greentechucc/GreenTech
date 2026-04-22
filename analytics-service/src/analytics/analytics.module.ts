import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiRecord } from './kpi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KpiRecord])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
