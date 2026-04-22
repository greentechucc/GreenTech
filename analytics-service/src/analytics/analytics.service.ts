import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiRecord } from './kpi.entity';
import Redis from 'ioredis';

@Injectable()
export class AnalyticsService {
  private redisSub: Redis;
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(KpiRecord)
    private kpiRepo: Repository<KpiRecord>
  ) {
    this.redisSub = new Redis({ host: 'localhost', port: 6379 });
    this.initSubscriptions();
  }

  private initSubscriptions() {
    // Analytics listens to EVERYTHING to build KPIs
    const events = ['project.stage.changed', 'payment.received', 'permit.status.updated', 'lead.created', 'lead.converted'];
    
    events.forEach(ch => this.redisSub.subscribe(ch));

    this.redisSub.on('message', async (channel, message) => {
      this.logger.log(`Analytics captured event from ${channel}: ${message}`);
      
      let metricName = 'UNKNOWN';
      if (channel === 'lead.created') metricName = 'LEAD_CREATED';
      if (channel === 'lead.converted') metricName = 'LEAD_CONVERTED';
      if (channel === 'payment.received') metricName = 'PAYMENT_RECEIVED';
      if (channel === 'project.stage.changed') {
        const payload = JSON.parse(message);
        if (payload.stage === 'COMPLETED') metricName = 'PROJECT_COMPLETED';
        else metricName = `PROJECT_${payload.stage}`;
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
    // Calcula las conversiones. En TypeORM puro usaríamos query builder
    const qb = this.kpiRepo.createQueryBuilder('kpi')
      .select('kpi.metric_name', 'metric_name')
      .addSelect('SUM(kpi.value)', 'total')
      .where('kpi.metric_name IN (:...metrics)', { metrics: ['LEAD_CREATED', 'LEAD_CONVERTED', 'PROJECT_COMPLETED'] })
      .groupBy('kpi.metric_name');
      
    const results = await qb.getRawMany();
    
    const stats: Record<string, number> = {};
    results.forEach(r => stats[r.metric_name] = parseInt(r.total, 10));

    const leads = stats['LEAD_CREATED'] || 1; // Prevent div by zero
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
}
