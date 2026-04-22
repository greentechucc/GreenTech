import { PortalService } from './portal.service';
export declare class PortalController {
    private readonly portalService;
    constructor(portalService: PortalService);
    register(data: any): Promise<{
        success: boolean;
        email: string;
        name: string;
    }>;
    login(credentials: any): Promise<{
        success: boolean;
        email: string;
        name: string;
    }>;
    getDashboard(customerEmail: string): Promise<{
        customer_email: string;
        projects: never[];
        telemetry: null;
        invoices?: undefined;
    } | {
        customer_email: string;
        projects: any[];
        telemetry: any;
        invoices: any;
    }>;
}
