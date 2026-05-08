import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permit } from './permit.entity';
import { PermitDocument } from './permit-document.entity';
import { UtilityRequirement } from './utility-requirement.entity';
import { OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

const DEFAULT_UTILITY_REQS = [
  { utility_company: 'EPM', permit_type: 'Conexión a Red (AGPE)', required_documents: JSON.stringify(['Solicitud AGPE', 'Fotocopia Cédula', 'Certificado RETIE', 'Diagrama Unifilar', 'Recibo de Energía']), estimated_processing_days: 15 },
  { utility_company: 'Enel', permit_type: 'Conexión a Red (AGPE)', required_documents: JSON.stringify(['Formulario Enel', 'Diagrama Unifilar Aprobado', 'Certificado RETIE', 'Poder Autenticado']), estimated_processing_days: 20 },
  { utility_company: 'Celsia', permit_type: 'Conexión a Red (AGPE)', required_documents: JSON.stringify(['Solicitud de Conexión', 'Documento de Identidad', 'Certificado RETIE', 'Certificado RETILAP', 'Factura de Energía']), estimated_processing_days: 12 },
  { utility_company: 'Air-E', permit_type: 'Conexión a Red (AGPE)', required_documents: JSON.stringify(['Formato Air-E', 'Copia de Factura', 'Diagrama Unifilar Firmado', 'Matrícula Profesional Ingeniero']), estimated_processing_days: 25 },
];

@Injectable()
export class PermitService implements OnModuleInit {
  private readonly logger = new Logger(PermitService.name);
  private redisPub: Redis | null = null;
  private redisSub: Redis | null = null;

  constructor(
    @InjectRepository(Permit)
    private permitRepository: Repository<Permit>,
    @InjectRepository(PermitDocument)
    private documentRepository: Repository<PermitDocument>,
    @InjectRepository(UtilityRequirement)
    private utilityReqRepository: Repository<UtilityRequirement>,
  ) {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redisPub = new Redis(redisUrl, { maxRetriesPerRequest: 1, retryStrategy: () => null });
      this.redisSub = new Redis(redisUrl, { maxRetriesPerRequest: 1, retryStrategy: () => null });
      this.redisPub.on('error', () => { this.redisPub = null; });
      this.redisSub.on('error', () => { this.redisSub = null; });
      this.initSubscriptions();
    } catch {
      this.logger.warn('Redis not available, permit service running without pub/sub');
      this.redisPub = null;
      this.redisSub = null;
    }
  }

  async onModuleInit() {
    let inserted = 0;
    for (const req of DEFAULT_UTILITY_REQS) {
      const exists = await this.utilityReqRepository.findOneBy({ utility_company: req.utility_company, permit_type: req.permit_type });
      if (!exists) {
        await this.utilityReqRepository.save(this.utilityReqRepository.create(req));
        inserted++;
      }
    }
    if (inserted > 0) {
      this.logger.log(`Seeded ${inserted} utility requirements`);
    }
  }

  async getUtilityRequirements() {
    return this.utilityReqRepository.find({ order: { utility_company: 'ASC' } });
  }

  async getRequirementsForCompany(company: string) {
    return this.utilityReqRepository.find({ where: { utility_company: company } });
  }

  private initSubscriptions() {
    if (!this.redisSub) return;
    
    this.redisSub.subscribe('project.stage.changed', (err) => {
      if (err) this.logger.error('Failed to subscribe', err);
    });

    this.redisSub.on('message', async (channel, message) => {
      if (channel === 'project.stage.changed') {
        const payload = JSON.parse(message);
        this.logger.log(`Received stage change for project ${payload.projectId}: ${payload.stage}`);
        if (payload.stage === 'PERMITTING_REQUIRED') {
            await this.autoCreatePermit(payload.projectId);
        }
      }
    });
  }

  async findAll(): Promise<Permit[]> {
    return this.permitRepository.find({ relations: ['documents'] });
  }

  async findOne(id: number): Promise<Permit | null> {
    return this.permitRepository.findOne({ where: { id }, relations: ['documents'] });
  }

  async create(data: Partial<Permit>): Promise<Permit> {
    const permit = this.permitRepository.create(data);
    return this.permitRepository.save(permit);
  }

  async autoCreatePermit(projectId: number) {
    const permit = this.permitRepository.create({
        project_id: projectId,
        utility_company: 'Default Utility',
        permit_type: 'SOLAR_INTERCONNECTION',
        status: 'DRAFT',
    });
    await this.permitRepository.save(permit);
    this.logger.log(`Auto created draft permit for project ${projectId}`);
  }

  async updateStatus(id: number, status: string, reason?: string): Promise<Permit> {
    const permit = await this.findOne(id);
    if (!permit) throw new Error('Permit not found');
    
    permit.status = status;
    if (reason) permit.rejection_reason = reason;
    if (status === 'APPROVED') permit.approval_date = new Date();
    
    const updated = await this.permitRepository.save(permit);
    
    // Publicar evento
    if (this.redisPub) {
      this.redisPub.publish('permit.status.updated', JSON.stringify({
          permitId: updated.id,
          projectId: updated.project_id,
          status: updated.status
      }));
    }
    
    return updated;
  }

  async update(id: number, data: Partial<Permit>): Promise<Permit> {
    const permit = await this.permitRepository.findOneBy({ id });
    if (!permit) {
      throw new Error(`Permit con ID ${id} no encontrado`);
    }

    if (data.project_id !== undefined) permit.project_id = data.project_id;
    if (data.utility_company !== undefined) permit.utility_company = data.utility_company;
    if (data.permit_type !== undefined) permit.permit_type = data.permit_type;
    if (data.status !== undefined) permit.status = data.status;

    return this.permitRepository.save(permit);
  }

  async remove(id: number): Promise<void> {
    const permit = await this.permitRepository.findOneBy({ id });
    if (!permit) {
      throw new Error(`Permit con ID ${id} no encontrado`);
    }
    await this.permitRepository.remove(permit);
  }
}
