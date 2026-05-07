export declare class AuditLog {
    id: number;
    user_id: string;
    user_email: string;
    user_role: string;
    action: string;
    entity: string;
    entity_id: string;
    details: string;
    created_at: Date;
}
