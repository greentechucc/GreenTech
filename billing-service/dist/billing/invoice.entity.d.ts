import { Payment } from './payment.entity';
export declare class Invoice {
    id: number;
    project_id: number;
    customer_id: number;
    customer_name: string;
    concept: string;
    amount: number;
    status: string;
    due_date: Date;
    paid_at: Date;
    created_at: Date;
    payments: Payment[];
}
