import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Incident } from './incident.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {

  constructor(
    @InjectRepository(Project)
    private repo: Repository<Project>,
    @InjectRepository(Incident)
    private incidentRepo: Repository<Incident>,
  ) {}

  async createProject(data: any) {
    const project = this.repo.create({
      customer_name: data.customer_name || data.name,
      customer_email: data.customer_email || data.email || '',
      name: data.project_name || data.name || '',
      system_size: data.system_size || '',
      status: data.status || 'CREATED',
      completion: data.completion || 0,
      estimated_amount: data.estimated_amount || 0,
      assigned_crew: data.assigned_crew || null,
      planned_start_date: data.planned_start_date ? new Date(data.planned_start_date) : null,
      planned_end_date: data.planned_end_date ? new Date(data.planned_end_date) : null,
    });

    return this.repo.save(project);
  }

  findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async update(id: number, data: any) {
    const project = await this.repo.findOneBy({ id });
    if (!project) return null;

    if (data.project_name !== undefined) project.name = data.project_name;
    if (data.customer_name !== undefined) project.customer_name = data.customer_name;
    if (data.customer_email !== undefined) project.customer_email = data.customer_email;
    if (data.system_size !== undefined) project.system_size = data.system_size;
    if (data.status !== undefined) project.status = data.status;
    if (data.completion !== undefined) project.completion = data.completion;
    if (data.estimated_amount !== undefined) project.estimated_amount = data.estimated_amount;
    if (data.assigned_crew !== undefined) project.assigned_crew = data.assigned_crew;
    if (data.planned_start_date !== undefined) project.planned_start_date = data.planned_start_date ? new Date(data.planned_start_date) : null;
    if (data.planned_end_date !== undefined) project.planned_end_date = data.planned_end_date ? new Date(data.planned_end_date) : null;

    return this.repo.save(project);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  // Incidencias
  async reportIncident(projectId: number, data: any) {
    const incident = this.incidentRepo.create({
      project_id: projectId,
      type: data.type || 'OTRO',
      description: data.description,
      status: 'OPEN',
    });
    return this.incidentRepo.save(incident);
  }

  async resolveIncident(incidentId: number) {
    const incident = await this.incidentRepo.findOneBy({ id: incidentId });
    if (incident) {
      incident.status = 'RESOLVED';
      return this.incidentRepo.save(incident);
    }
    return null;
  }

  async getIncidents(projectId: number) {
    return this.incidentRepo.find({ where: { project_id: projectId }, order: { reported_at: 'DESC' } });
  }
}