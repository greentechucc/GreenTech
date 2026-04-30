import { CustomerUser } from './customer-user.entity';
import { Ticket } from './ticket.entity';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
export declare class PortalService {
    private userRepo;
    private ticketRepo;
    private mailService;
    private readonly PROJECT_API;
    private readonly MONITORING_API;
    private readonly BILLING_API;
    constructor(userRepo: Repository<CustomerUser>, ticketRepo: Repository<Ticket>, mailService: MailService);
    register(data: any): Promise<{
        success: boolean;
        email: string;
        name: string;
    }>;
    getAllUsers(): Promise<CustomerUser[]>;
    deleteUser(id: number): Promise<{
        success: boolean;
        message: string;
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
    createTicket(data: any): Promise<Ticket>;
    getTickets(customerEmail: string): Promise<Ticket[]>;
    getAllTickets(): Promise<Ticket[]>;
    respondTicket(id: string, resolution: string, assignedTo: string): Promise<Ticket>;
    closeTicket(id: string): Promise<Ticket>;
    getProfile(email: string): Promise<{
        name: string;
        email: string;
        phone: string;
        address: string;
        avatar_url: string;
    }>;
    updateContact(email: string, phone: string, address: string, name?: string): Promise<{
        success: boolean;
    }>;
    updatePassword(email: string, currentPass: string, newPass: string): Promise<{
        success: boolean;
    }>;
    updateAvatar(email: string, avatarDataUrl: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
    }>;
    verifyResetCode(email: string, code: string): Promise<{
        success: boolean;
    }>;
    resetPassword(email: string, code: string, newPass: string): Promise<{
        success: boolean;
    }>;
    unlockAccount(token: string): Promise<{
        success: boolean;
    }>;
}
