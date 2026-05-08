"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PermitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermitService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permit_entity_1 = require("./permit.entity");
const permit_document_entity_1 = require("./permit-document.entity");
const utility_requirement_entity_1 = require("./utility-requirement.entity");
const ioredis_1 = __importDefault(require("ioredis"));
const DEFAULT_UTILITY_REQS = [
    { utility_company: 'EPM', permit_type: 'Conexión a Red (AGPE)', required_documents: JSON.stringify(['Solicitud AGPE', 'Fotocopia Cédula', 'Certificado RETIE', 'Diagrama Unifilar', 'Recibo de Energía']), estimated_processing_days: 15 },
    { utility_company: 'Enel', permit_type: 'Conexión a Red (AGPE)', required_documents: JSON.stringify(['Formulario Enel', 'Diagrama Unifilar Aprobado', 'Certificado RETIE', 'Poder Autenticado']), estimated_processing_days: 20 },
    { utility_company: 'Celsia', permit_type: 'Conexión a Red (AGPE)', required_documents: JSON.stringify(['Solicitud de Conexión', 'Documento de Identidad', 'Certificado RETIE', 'Certificado RETILAP', 'Factura de Energía']), estimated_processing_days: 12 },
    { utility_company: 'Air-E', permit_type: 'Conexión a Red (AGPE)', required_documents: JSON.stringify(['Formato Air-E', 'Copia de Factura', 'Diagrama Unifilar Firmado', 'Matrícula Profesional Ingeniero']), estimated_processing_days: 25 },
];
let PermitService = PermitService_1 = class PermitService {
    permitRepository;
    documentRepository;
    utilityReqRepository;
    logger = new common_1.Logger(PermitService_1.name);
    redisPub = null;
    redisSub = null;
    constructor(permitRepository, documentRepository, utilityReqRepository) {
        this.permitRepository = permitRepository;
        this.documentRepository = documentRepository;
        this.utilityReqRepository = utilityReqRepository;
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
            this.redisPub = new ioredis_1.default(redisUrl);
            this.redisSub = new ioredis_1.default(redisUrl);
            this.initSubscriptions();
            this.logger.log('Redis connected for permit pub/sub');
        }
        else {
            this.logger.warn('REDIS_URL not set, permit service running without pub/sub');
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
    async getRequirementsForCompany(company) {
        return this.utilityReqRepository.find({ where: { utility_company: company } });
    }
    initSubscriptions() {
        if (!this.redisSub)
            return;
        this.redisSub.subscribe('project.stage.changed', (err) => {
            if (err)
                this.logger.error('Failed to subscribe', err);
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
    async findAll() {
        return this.permitRepository.find({ relations: ['documents'] });
    }
    async findOne(id) {
        return this.permitRepository.findOne({ where: { id }, relations: ['documents'] });
    }
    async create(data) {
        const permit = this.permitRepository.create(data);
        return this.permitRepository.save(permit);
    }
    async autoCreatePermit(projectId) {
        const permit = this.permitRepository.create({
            project_id: projectId,
            utility_company: 'Default Utility',
            permit_type: 'SOLAR_INTERCONNECTION',
            status: 'DRAFT',
        });
        await this.permitRepository.save(permit);
        this.logger.log(`Auto created draft permit for project ${projectId}`);
    }
    async updateStatus(id, status, reason) {
        const permit = await this.findOne(id);
        if (!permit)
            throw new Error('Permit not found');
        permit.status = status;
        if (reason)
            permit.rejection_reason = reason;
        if (status === 'APPROVED')
            permit.approval_date = new Date();
        const updated = await this.permitRepository.save(permit);
        if (this.redisPub) {
            this.redisPub.publish('permit.status.updated', JSON.stringify({
                permitId: updated.id,
                projectId: updated.project_id,
                status: updated.status
            }));
        }
        return updated;
    }
    async update(id, data) {
        const permit = await this.permitRepository.findOneBy({ id });
        if (!permit) {
            throw new Error(`Permit con ID ${id} no encontrado`);
        }
        if (data.project_id !== undefined)
            permit.project_id = data.project_id;
        if (data.utility_company !== undefined)
            permit.utility_company = data.utility_company;
        if (data.permit_type !== undefined)
            permit.permit_type = data.permit_type;
        if (data.status !== undefined)
            permit.status = data.status;
        return this.permitRepository.save(permit);
    }
    async remove(id) {
        const permit = await this.permitRepository.findOneBy({ id });
        if (!permit) {
            throw new Error(`Permit con ID ${id} no encontrado`);
        }
        await this.permitRepository.remove(permit);
    }
};
exports.PermitService = PermitService;
exports.PermitService = PermitService = PermitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permit_entity_1.Permit)),
    __param(1, (0, typeorm_1.InjectRepository)(permit_document_entity_1.PermitDocument)),
    __param(2, (0, typeorm_1.InjectRepository)(utility_requirement_entity_1.UtilityRequirement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PermitService);
//# sourceMappingURL=permit.service.js.map