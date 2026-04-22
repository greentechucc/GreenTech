import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Telemetry } from './telemetry.entity';
import { Inverter } from './inverter.entity';
import Redis from 'ioredis';

@Injectable()
export class MonitoringService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MonitoringService.name);
  private redisPub: Redis;

  constructor(
    @InjectRepository(Telemetry)
    private telemetryRepo: Repository<Telemetry>,
    @InjectRepository(Inverter)
    private inverterRepo: Repository<Inverter>,
    private dataSource: DataSource
  ) {
    this.redisPub = new Redis({ host: 'localhost', port: 6379 });
  }

  // Convert table to timescale hypertable if needed
  async onApplicationBootstrap() {
    try {
      await this.dataSource.query(`SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE);`);
      this.logger.log('TimescaleDB hypertable initialized on telemetry');
    } catch (e) {
      this.logger.warn('Could not initialize hypertable. Is TimescaleDB extension enabled? ' + e.message);
    }
  }

  async ingestTelemetry(data: Partial<Telemetry>) {
    const record = this.telemetryRepo.create({
      ...data,
      time: data.time || new Date()
    });
    
    await this.telemetryRepo.save(record);
    
    // Update last communication
    await this.inverterRepo.update(
      { serial_number: record.inverter_id },
      { last_communication: record.time }
    );

    // Alert check
    if (record.status === 'ERROR' || record.power_output_kw === 0) {
      this.redisPub.publish('monitoring.alert', JSON.stringify({
        inverterId: record.inverter_id,
        status: record.status,
        power: record.power_output_kw,
        time: record.time
      }));
    }
    
    return record;
  }

  async findAllInverters() {
    return this.inverterRepo.find({ order: { installation_date: 'DESC' } });
  }

  async createInverter(data: Partial<Inverter>) {
    const inverter = this.inverterRepo.create({
      ...data,
      installation_date: data.installation_date || new Date(),
    });
    return this.inverterRepo.save(inverter);
  }

  async updateInverter(id: number, data: Partial<Inverter>) {
    const inverter = await this.inverterRepo.findOneBy({ id });
    if (!inverter) throw new Error('Inverter not found');
    Object.assign(inverter, data);
    return this.inverterRepo.save(inverter);
  }

  async removeInverter(id: number) {
    const inverter = await this.inverterRepo.findOneBy({ id });
    if (!inverter) throw new Error('Inverter not found');
    return this.inverterRepo.remove(inverter);
  }

  async getDashboard(projectId: number) {
    const inverters = await this.inverterRepo.find({ where: { project_id: projectId } });
    if (!inverters.length) return { inverters: [], telemetry: [] };

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

  async calculateSavings(projectId: number) {
    const inverters = await this.inverterRepo.find({ where: { project_id: projectId } });
    if (!inverters.length) return { saved_kwh: 0, savings_cop: 0, tarifa_promedio: 0 };

    const inverterIds = inverters.map(i => i.serial_number);

    // Get total daily yield kW for today (simulated as summing average powers or we can use telemetry records directly)
    // In a real system, daily_yield is accumulated by the inverter or we integrate power over time.
    // For simplicity, we assume we sum the daily_yield_kw entries of the last 24h.
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
    const tarifa_promedio_cop = 850; // COP per kWh (Tarifa comercial simplificada)
    const savings = yield_kwh * tarifa_promedio_cop;

    return {
      saved_kwh: yield_kwh,
      savings_cop: savings,
      tarifa_promedio: tarifa_promedio_cop,
      period: '24h'
    };
  }
}

