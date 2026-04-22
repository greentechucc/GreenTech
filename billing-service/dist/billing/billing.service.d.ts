import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';
export declare class BillingService {
    private invoiceRepo;
    private paymentRepo;
    private readonly logger;
    private redisPub;
    private redisSub;
    constructor(invoiceRepo: Repository<Invoice>, paymentRepo: Repository<Payment>);
    private initSubscriptions;
    findAll(): Promise<Invoice[]>;
    generateMilestones(projectId: number, customerId: number, totalAmount: number, customer_name?: string, baseConcept?: string): Promise<Invoice[]>;
    update(id: number, data: any): Promise<Invoice | null>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    recordPayment(invoiceId: number, amount: number, method: string, transactionId?: string): Promise<Payment>;
}
