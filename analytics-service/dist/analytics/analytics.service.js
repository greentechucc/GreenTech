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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kpi_entity_1 = require("./kpi.entity");
const ioredis_1 = __importDefault(require("ioredis"));
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    kpiRepo;
    redisSub;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(kpiRepo) {
        this.kpiRepo = kpiRepo;
        this.redisSub = new ioredis_1.default({ host: 'localhost', port: 6379 });
        this.initSubscriptions();
    }
    initSubscriptions() {
        const events = ['project.stage.changed', 'payment.received', 'permit.status.updated', 'lead.created', 'lead.converted'];
        events.forEach(ch => this.redisSub.subscribe(ch));
        this.redisSub.on('message', async (channel, message) => {
            this.logger.log(`Analytics captured event from ${channel}: ${message}`);
            let metricName = 'UNKNOWN';
            if (channel === 'lead.created')
                metricName = 'LEAD_CREATED';
            if (channel === 'lead.converted')
                metricName = 'LEAD_CONVERTED';
            if (channel === 'payment.received')
                metricName = 'PAYMENT_RECEIVED';
            if (channel === 'project.stage.changed') {
                const payload = JSON.parse(message);
                if (payload.stage === 'COMPLETED')
                    metricName = 'PROJECT_COMPLETED';
                else
                    metricName = `PROJECT_${payload.stage}`;
            }
            if (metricName !== 'UNKNOWN') {
                await this.kpiRepo.save(this.kpiRepo.create({ metric_name: metricName, value: 1 }));
            }
        });
    }
    getDashboard() {
        return {
            revenueMTD: 50000,
            activeProjects: 12,
            permitsPending: 3,
            telemetryAlerts: 1
        };
    }
    async getFunnel() {
        const qb = this.kpiRepo.createQueryBuilder('kpi')
            .select('kpi.metric_name', 'metric_name')
            .addSelect('SUM(kpi.value)', 'total')
            .where('kpi.metric_name IN (:...metrics)', { metrics: ['LEAD_CREATED', 'LEAD_CONVERTED', 'PROJECT_COMPLETED'] })
            .groupBy('kpi.metric_name');
        const results = await qb.getRawMany();
        const stats = {};
        results.forEach(r => stats[r.metric_name] = parseInt(r.total, 10));
        const leads = stats['LEAD_CREATED'] || 1;
        const converted = stats['LEAD_CONVERTED'] || 0;
        const completed = stats['PROJECT_COMPLETED'] || 0;
        return {
            funnel: {
                leads: stats['LEAD_CREATED'] || 0,
                proposals_accepted: converted,
                installed: completed,
            },
            conversion_rates: {
                lead_to_customer: (converted / leads) * 100,
                customer_to_installed: converted > 0 ? (completed / converted) * 100 : 0
            }
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(kpi_entity_1.KpiRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map