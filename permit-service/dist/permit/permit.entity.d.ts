import { PermitDocument } from './permit-document.entity';
export declare class Permit {
    id: number;
    project_id: number;
    utility_company: string;
    permit_type: string;
    application_date: Date;
    status: string;
    rejection_reason: string;
    approval_date: Date;
    documents: PermitDocument[];
}
