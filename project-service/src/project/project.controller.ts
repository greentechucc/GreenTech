import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {

  constructor(private service: ProjectService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.service.createProject(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Post(':id/incidents')
  reportIncident(@Param('id') id: string, @Body() body: any) {
    return this.service.reportIncident(Number(id), body);
  }

  @Get(':id/incidents')
  getIncidents(@Param('id') id: string) {
    return this.service.getIncidents(Number(id));
  }

  @Put('incidents/:incidentId/resolve')
  resolveIncident(@Param('incidentId') incidentId: string) {
    return this.service.resolveIncident(Number(incidentId));
  }
}