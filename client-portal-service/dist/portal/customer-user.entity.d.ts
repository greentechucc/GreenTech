export declare class CustomerUser {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    phone: string;
    address: string;
    avatar_url: string;
    reset_code: string;
    reset_expires_at: Date;
    failed_login_attempts: number;
    login_locked_until: Date;
    failed_reset_attempts: number;
    reset_locked_until: Date;
    unlock_token: string;
    created_at: Date;
}
