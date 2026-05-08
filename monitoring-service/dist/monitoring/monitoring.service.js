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
var MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const telemetry_entity_1 = require("./telemetry.entity");
const inverter_entity_1 = require("./inverter.entity");
const ioredis_1 = __importDefault(require("ioredis"));
let MonitoringService = MonitoringService_1 = class MonitoringService {
    telemetryRepo;
    inverterRepo;
    dataSource;
    logger = new common_1.Logger(MonitoringService_1.name);
    redisPub = null;
    constructor(telemetryRepo, inverterRepo, dataSource) {
        this.telemetryRepo = telemetryRepo;
        this.inverterRepo = inverterRepo;
        this.dataSource = dataSource;
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            this.redisPub = new ioredis_1.default(redisUrl, { maxRetriesPerRequest: 1, retryStrategy: () => null });
            this.redisPub.on('error', () => {
                this.logger.warn('Redis not available, monitoring running without pub/sub');
                this.redisPub = null;
            });
        }
        catch {
            this.logger.warn('Redis not available, monitoring running without pub/sub');
            this.redisPub = null;
        }
    }
    async onApplicationBootstrap() {
        try {
            await this.dataSource.query(`SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE);`);
            this.logger.log('TimescaleDB hypertable initialized on telemetry');
        }
        catch (e) {
            this.logger.warn('Could not initialize hypertable. Is TimescaleDB extension enabled? ' + e.message);
        }
    }
    async ingestTelemetry(data) {
        const record = this.telemetryRepo.create({
            ...data,
            time: data.time || new Date()
        });
        await this.telemetryRepo.save(record);
        await this.inverterRepo.update({ serial_number: record.inverter_id }, { last_communication: record.time });
        if (record.status === 'ERROR' || record.power_output_kw === 0) {
            if (this.redisPub) {
                this.redisPub.publish('monitoring.alert', JSON.stringify({
                    inverterId: record.inverter_id,
                    status: record.status,
                    power: record.power_output_kw,
                    time: record.time
                }));
            }
        }
        return record;
    }
    async findAllInverters() {
        return this.inverterRepo.find({ order: { installation_date: 'DESC' } });
    }
    async createInverter(data) {
        const inverter = this.inverterRepo.create({
            ...data,
            installation_date: data.installation_date || new Date(),
        });
        return this.inverterRepo.save(inverter);
    }
    async updateInverter(id, data) {
        const inverter = await this.inverterRepo.findOneBy({ id });
        if (!inverter)
            throw new Error('Inverter not found');
        Object.assign(inverter, data);
        return this.inverterRepo.save(inverter);
    }
    async removeInverter(id) {
        const inverter = await this.inverterRepo.findOneBy({ id });
        if (!inverter)
            throw new Error('Inverter not found');
        return this.inverterRepo.remove(inverter);
    }
    async getDashboard(projectId) {
        const inverters = await this.inverterRepo.find({ where: { project_id: projectId } });
        if (!inverters.length)
            return { inverters: [], telemetry: [] };
        const inverterIds = inverters.map(i => i.serial_number);
        const stats = await this.dataSource.query(`
      SELECT 
        time_bucket('1 hour', time) AS bucket,
        inverter_id,
        AVG(power_output_kw) as avg_power
      FROM telemetry
      WHERE inverter_id = ANY($1)
      AND time > NOW() - INTERVAL '24 hours'
      GROUP BY bucket, inverter_id
      ORDER BY bucket DESC
    `, [inverterIds]);
        return { inverters, history: stats };
    }
    async calculateSavings(projectId) {
        const inverters = await this.inverterRepo.find({ where: { project_id: projectId } });
        if (!inverters.length)
            return { saved_kwh: 0, savings_cop: 0, tarifa_promedio: 0 };
        const inverterIds = inverters.map(i => i.serial_number);
        const result = await this.dataSource.query(`
      SELECT 
        SUM(daily_yield_kw) as total_yield
      FROM (
        SELECT inverter_id, MAX(daily_yield_kw) as daily_yield_kw
        FROM telemetry
        WHERE inverter_id = ANY($1)
        AND time > NOW() - INTERVAL '24 hours'
        GROUP BY inverter_id
      ) as max_yields
    `, [inverterIds]);
        const yield_kwh = result[0]?.total_yield || 0;
        const tarifa_promedio_cop = 850;
        const savings = yield_kwh * tarifa_promedio_cop;
        return {
            saved_kwh: yield_kwh,
            savings_cop: savings,
            tarifa_promedio: tarifa_promedio_cop,
            period: '24h'
        };
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(telemetry_entity_1.Telemetry)),
    __param(1, (0, typeorm_1.InjectRepository)(inverter_entity_1.Inverter)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map