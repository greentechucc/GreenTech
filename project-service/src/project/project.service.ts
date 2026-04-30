import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Incident } from './incident.entity';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import axios from 'axios';

const DEFAULT_TASKS = [
  { id: 1, name: 'Visita técnica y evaluación del sitio', done: false },
  { id: 2, name: 'Diseño del sistema fotovoltaico', done: false },
  { id: 3, name: 'Adquisición de materiales y equipos', done: false },
  { id: 4, name: 'Trámites y permisos municipales', done: false },
  { id: 5, name: 'Instalación de paneles y estructura', done: false },
  { id: 6, name: 'Conexión eléctrica e inversores', done: false },
  { id: 7, name: 'Pruebas de funcionamiento', done: false },
  { id: 8, name: 'Conexión a la red eléctrica', done: false },
  { id: 9, name: 'Capacitación al cliente', done: false },
  { id: 10, name: 'Entrega final y documentación', done: false },
];

@Injectable()
export class ProjectService {

  private redisClient: Redis;

  constructor(
    @InjectRepository(Project)
    private repo: Repository<Project>,
    @InjectRepository(Incident)
    private incidentRepo: Repository<Incident>,
  ) {
    this.redisClient = new Redis();
  }

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
      bom_json: data.bom_json || '',
      tasks: JSON.stringify(DEFAULT_TASKS),
    });

    return this.repo.save(project);
  }

  async findOne(id: number) {
    const project = await this.repo.findOneBy({ id });
    return project || null;
  }

  async updateTasks(id: number, tasks: any[]) {
    const project = await this.repo.findOneBy({ id });
    if (!project) return null;

    // Detect if task 3 "Adquisición de materiales" is being marked as done
    const oldTasks = project.tasks ? JSON.parse(project.tasks) : [];
    const oldTask3 = oldTasks.find((t: any) => t.id === 3);
    const newTask3 = tasks.find((t: any) => t.id === 3);
    
    if (oldTask3 && !oldTask3.done && newTask3 && newTask3.done) {
      if (project.bom_json) {
        // Double mechanism: HTTP (immediate) + Redis fallback
        try {
          await axios.post('http://localhost:3002/inventory/deduct/bom', { bom_json: project.bom_json });
        } catch (e) {
           console.warn('HTTP inventory deduct failed, fallback to Redis', e.message);
           this.redisClient.publish('inventory.deduct', JSON.stringify({
             projectId: project.id,
             bom_json: project.bom_json,
           }));
        }
      }
    }

    const total = tasks.length;
    const done = tasks.filter((t: any) => t.done).length;
    project.tasks = JSON.stringify(tasks);
    project.completion = total > 0 ? Math.round((done / total) * 100) : 0;
    
    // Auto-update status based on completion progression
    if (done === 10) project.status = 'COMPLETED';
    else if (done >= 8) project.status = 'GRID_CONNECTION';
    else if (done >= 5) project.status = 'INSTALLATION';
    else if (done >= 4) project.status = 'APPROVED';
    else if (done >= 3) project.status = 'PERMIT_PROCESS';
    else if (done >= 2) project.status = 'DESIGN';
    else if (done >= 1) project.status = 'TECHNICAL_VISIT';
    else project.status = 'CREATED';

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
    if (data.bom_json !== undefined) project.bom_json = data.bom_json;
    // Initialize tasks for existing projects that don't have them yet
    if (!project.tasks) project.tasks = JSON.stringify(DEFAULT_TASKS);

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