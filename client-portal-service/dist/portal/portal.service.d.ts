import { CustomerUser } from './customer-user.entity';
import { Repository } from 'typeorm';
export declare class PortalService {
    private userRepo;
    private readonly PROJECT_API;
    private readonly MONITORING_API;
    private readonly BILLING_API;
    constructor(userRepo: Repository<CustomerUser>);
    register(data: any): Promise<{
        success: boolean;
        email: string;
        name: string;
    }>;
    login(email: string, password: string): Promise<{
        success: boolean;
        email: string;
        name: string;
    }>;
    getCustomerDashboard(customerEmail: string): Promise<{
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
