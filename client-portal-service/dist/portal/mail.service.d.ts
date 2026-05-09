export declare class MailService {
    private transporter;
    constructor();
    sendWelcomeEmail(toEmail: string, userName: string): Promise<void>;
    private buildWelcomeHtml;
    sendResetEmail(toEmail: string, code: string, userName: string): Promise<void>;
    private buildResetHtml;
    sendSecurityAlertEmail(toEmail: string, userName: string, unlockToken: string): Promise<void>;
    private buildSecurityAlertHtml;
    sendNoAccountEmail(toEmail: string): Promise<void>;
    private buildNoAccountHtml;
}
