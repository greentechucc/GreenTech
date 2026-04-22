import { Permit } from './permit.entity';
export declare class PermitDocument {
    id: number;
    permit_id: number;
    permit: Permit;
    document_type: string;
    file_url: string;
    uploaded_at: Date;
}
