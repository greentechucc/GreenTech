import { PortalService } from './portal.service';
export declare class PortalController {
    private readonly portalService;
    constructor(portalService: PortalService);
    getAllUsers(): Promise<import("./customer-user.entity").CustomerUser[]>;
    deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
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
    createTicket(data: any): Promise<import("./ticket.entity").Ticket>;
    getTickets(customerEmail: string): Promise<import("./ticket.entity").Ticket[]>;
    getAllTickets(): Promise<import("./ticket.entity").Ticket[]>;
    respondTicket(id: string, body: {
        resolution: string;
        assigned_to: string;
    }): Promise<import("./ticket.entity").Ticket>;
    closeTicket(id: string): Promise<import("./ticket.entity").Ticket>;
    getProfile(email: string): Promise<{
        name: string;
        email: string;
        phone: string;
        address: string;
        avatar_url: string;
    }>;
    updateContact(body: {
        email: string;
        phone: string;
        address: string;
        name?: string;
    }): Promise<{
        success: boolean;
    }>;
    updatePassword(body: {
        email: string;
        currentPass: string;
        newPass: string;
    }): Promise<{
        success: boolean;
    }>;
    updateAvatar(body: {
        email: string;
        avatarDataUrl: string;
    }): Promise<{
        success: boolean;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        success: boolean;
    }>;
    verifyResetCode(body: {
        email: string;
        code: string;
    }): Promise<{
        success: boolean;
    }>;
    resetPassword(body: {
        email: string;
        code: string;
        newPass: string;
    }): Promise<{
        success: boolean;
    }>;
    unlockAccount(body: {
        token: string;
    }): Promise<{
        success: boolean;
    }>;
}
