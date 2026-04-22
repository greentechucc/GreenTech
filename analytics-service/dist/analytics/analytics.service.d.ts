import { Repository } from 'typeorm';
import { KpiRecord } from './kpi.entity';
export declare class AnalyticsService {
    private kpiRepo;
    private redisSub;
    private readonly logger;
    constructor(kpiRepo: Repository<KpiRecord>);
    private initSubscriptions;
    getDashboard(): {
        revenueMTD: number;
        activeProjects: number;
        permitsPending: number;
        telemetryAlerts: number;
    };
    getFunnel(): Promise<{
        funnel: {
            leads: number;
            proposals_accepted: number;
            installed: number;
        };
        conversion_rates: {
            lead_to_customer: number;
            customer_to_installed: number;
        };
    }>;
}
