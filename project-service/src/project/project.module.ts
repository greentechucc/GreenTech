import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './project.entity';
import { Incident } from './incident.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Incident])],
  providers: [ProjectService],
  exports: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}