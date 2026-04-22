import { BillingService } from './billing.service';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    findAll(): Promise<import("./invoice.entity").Invoice[]>;
    createInvoice(data: {
        projectId: number;
        customerId: number;
        amount: number;
        concept?: string;
        customer_name?: string;
    }): Promise<import("./invoice.entity").Invoice[]>;
    generatePaymentLink(invoiceId: string): {
        link: string;
        provider: string;
        expires_in: string;
    };
    recordPayment(invoiceId: string, data: {
        amount: number;
        method: string;
        transactionId?: string;
    }): Promise<import("./payment.entity").Payment>;
    update(id: string, body: any): Promise<import("./invoice.entity").Invoice | null>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
