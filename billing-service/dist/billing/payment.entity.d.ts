import { Invoice } from './invoice.entity';
export declare class Payment {
    id: number;
    invoice_id: number;
    invoice: Invoice;
    transaction_id: string;
    amount: number;
    payment_method: string;
    status: string;
    created_at: Date;
}
