import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Telemetry } from './telemetry.entity';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post('telemetry')
  ingestData(@Body() data: Partial<Telemetry>) {
    return this.monitoringService.ingestTelemetry(data);
  }

  @Get('inverters')
  findAllInverters() {
    return this.monitoringService.findAllInverters();
  }

  @Post('inverters')
  createInverter(@Body() data: any) {
    return this.monitoringService.createInverter(data);
  }

  @Put('inverters/:id')
  updateInverter(@Param('id') id: string, @Body() data: any) {
    return this.monitoringService.updateInverter(+id, data);
  }

  @Delete('inverters/:id')
  removeInverter(@Param('id') id: string) {
    return this.monitoringService.removeInverter(+id);
  }

  @Get('dashboard/project/:id')
  getDashboard(@Param('id') id: string) {
    return this.monitoringService.getDashboard(+id);
  }

  @Get('savings/project/:id')
  getSavings(@Param('id') id: string) {
    return this.monitoringService.calculateSavings(parseInt(id, 10));
  }
}
