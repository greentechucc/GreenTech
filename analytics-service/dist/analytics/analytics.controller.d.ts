import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
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
