"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_user_entity_1 = require("./customer-user.entity");
const ticket_entity_1 = require("./ticket.entity");
const typeorm_2 = require("typeorm");
const mail_service_1 = require("./mail.service");
const axios_1 = __importDefault(require("axios"));
let PortalService = class PortalService {
    userRepo;
    ticketRepo;
    mailService;
    PROJECT_API = 'http://localhost:3003';
    MONITORING_API = 'http://localhost:3007';
    BILLING_API = 'http://localhost:3008';
    constructor(userRepo, ticketRepo, mailService) {
        this.userRepo = userRepo;
        this.ticketRepo = ticketRepo;
        this.mailService = mailService;
    }
    async register(data) {
        const existing = await this.userRepo.findOneBy({ email: data.email });
        if (existing) {
            throw new common_1.HttpException('Email already registered', common_1.HttpStatus.BAD_REQUEST);
        }
        const user = this.userRepo.create({
            name: data.name,
            email: data.email,
            password_hash: data.password,
        });
        const saved = await this.userRepo.save(user);
        this.mailService.sendWelcomeEmail(saved.email, saved.name).catch(() => { });
        return { success: true, email: saved.email, name: saved.name };
    }
    async getAllUsers() {
        return this.userRepo.find({
            select: ['id', 'email', 'name', 'phone', 'address', 'failed_login_attempts', 'login_locked_until', 'created_at']
        });
    }
    async deleteUser(id) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) {
            throw new common_1.HttpException('Cliente no encontrado', common_1.HttpStatus.NOT_FOUND);
        }
        await this.userRepo.remove(user);
        return { success: true, message: 'Cliente eliminado permanentemente' };
    }
    async login(email, password) {
        const user = await this.userRepo.findOneBy({ email });
        if (!user) {
            throw new common_1.HttpException('Credenciales inválidas', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (user.login_locked_until && new Date() < new Date(user.login_locked_until)) {
            const waitMins = Math.ceil((new Date(user.login_locked_until).getTime() - new Date().getTime()) / 60000);
            throw new common_1.HttpException(`Cuenta bloqueada por seguridad. Revisa tu correo o intenta en ${waitMins} minutos.`, common_1.HttpStatus.FORBIDDEN);
        }
        if (user.password_hash !== password) {
            user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
            if (user.failed_login_attempts >= 3) {
                const lockTime = new Date();
                lockTime.setHours(lockTime.getHours() + 1);
                user.login_locked_until = lockTime;
                const token = require('crypto').randomUUID();
                user.unlock_token = token;
                await this.userRepo.save(user);
                this.mailService.sendSecurityAlertEmail(email, user.name, token).catch(() => { });
                throw new common_1.HttpException(`Demasiados intentos fallidos. Te hemos enviado un correo para desbloquear tu cuenta.`, common_1.HttpStatus.FORBIDDEN);
            }
            await this.userRepo.save(user);
            throw new common_1.HttpException(`Credenciales inválidas. Intento ${user.failed_login_attempts}/3 antes de bloqueo.`, common_1.HttpStatus.UNAUTHORIZED);
        }
        user.failed_login_attempts = 0;
        user.login_locked_until = null;
        user.unlock_token = null;
        await this.userRepo.save(user);
        return { success: true, email: user.email, name: user.name };
    }
    async getCustomerDashboard(customerEmail) {
        try {
            let projects = [];
            try {
                const { data } = await axios_1.default.get(`${this.PROJECT_API}/projects`);
                projects = data.filter((p) => p.customer_email === customerEmail || p.customer_name === customerEmail);
            }
            catch (e) {
                console.warn('Failed to fetch projects for portal', e.message);
            }
            if (projects.length === 0) {
                return {
                    customer_email: customerEmail,
                    projects: [],
                    telemetry: null
                };
            }
            const activeProject = projects[0];
            let telemetry = null;
            try {
                const { data } = await axios_1.default.get(`${this.MONITORING_API}/monitoring/savings/project/${activeProject.id}`);
                telemetry = data;
            }
            catch (e) {
                telemetry = { saved_kwh: 0, savings_cop: 0, period: '24h' };
            }
            let invoices = [];
            try {
                const { data } = await axios_1.default.get(`${this.BILLING_API}/billing/invoices`);
                invoices = data.filter((i) => i.project_id === activeProject.id || i.customer_name === customerEmail || i.customer_name === activeProject.customer_name);
            }
            catch (e) {
                console.warn('Failed to fetch invoices for portal');
            }
            return {
                customer_email: customerEmail,
                projects,
                telemetry,
                invoices
            };
        }
        catch (e) {
            throw new common_1.HttpException('Error fetching portal data', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createTicket(data) {
        if (!data.customer_email || !data.subject || !data.description) {
            throw new common_1.HttpException('Missing required fields', common_1.HttpStatus.BAD_REQUEST);
        }
        const ticket = this.ticketRepo.create({
            customer_email: data.customer_email,
            subject: data.subject,
            description: data.description,
            status: 'OPEN',
            created_at: new Date()
        });
        return this.ticketRepo.save(ticket);
    }
    async getTickets(customerEmail) {
        return this.ticketRepo.find({
            where: { customer_email: customerEmail },
            order: { created_at: 'DESC' }
        });
    }
    async getAllTickets() {
        return this.ticketRepo.find({ order: { created_at: 'DESC' } });
    }
    async respondTicket(id, resolution, assignedTo) {
        const ticket = await this.ticketRepo.findOneBy({ id });
        if (!ticket)
            throw new common_1.HttpException('Ticket no encontrado', common_1.HttpStatus.NOT_FOUND);
        ticket.resolution = resolution;
        ticket.assigned_to = assignedTo;
        ticket.status = 'IN_PROGRESS';
        return this.ticketRepo.save(ticket);
    }
    async closeTicket(id) {
        const ticket = await this.ticketRepo.findOneBy({ id });
        if (!ticket)
            throw new common_1.HttpException('Ticket no encontrado', common_1.HttpStatus.NOT_FOUND);
        ticket.status = 'CLOSED';
        ticket.resolved_at = new Date();
        return this.ticketRepo.save(ticket);
    }
    async getProfile(email) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user)
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        return {
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url
        };
    }
    async updateContact(email, phone, address) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user)
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        user.phone = phone;
        user.address = address;
        await this.userRepo.save(user);
        return { success: true };
    }
    async updatePassword(email, currentPass, newPass) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user)
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        if (user.password_hash !== currentPass) {
            throw new common_1.HttpException('Contraseña actual inválida', common_1.HttpStatus.BAD_REQUEST);
        }
        user.password_hash = newPass;
        await this.userRepo.save(user);
        return { success: true };
    }
    async updateAvatar(email, avatarDataUrl) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user)
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        user.avatar_url = avatarDataUrl;
        await this.userRepo.save(user);
        return { success: true };
    }
    async forgotPassword(email) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            this.mailService.sendNoAccountEmail(email).catch(() => { });
            throw new common_1.HttpException('Este correo no tiene cuenta asociada.', common_1.HttpStatus.NOT_FOUND);
        }
        if (user.reset_locked_until && new Date() < new Date(user.reset_locked_until)) {
            const waitMins = Math.ceil((new Date(user.reset_locked_until).getTime() - new Date().getTime()) / 60000);
            throw new common_1.HttpException(`Recuperación bloqueada térmporalmente. Intente en ${waitMins} minutos.`, common_1.HttpStatus.FORBIDDEN);
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        user.reset_code = code;
        user.reset_expires_at = expiresAt;
        await this.userRepo.save(user);
        this.mailService.sendResetEmail(email, code, user.name).catch(() => { });
        return { success: true };
    }
    async verifyResetCode(email, code) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.HttpException('Petición inválida', common_1.HttpStatus.BAD_REQUEST);
        }
        if (user.reset_locked_until && new Date() < new Date(user.reset_locked_until)) {
            const waitMins = Math.ceil((new Date(user.reset_locked_until).getTime() - new Date().getTime()) / 60000);
            throw new common_1.HttpException(`Recuperación bloqueada temporalmente. Intente en ${waitMins} minutos.`, common_1.HttpStatus.FORBIDDEN);
        }
        if (user.reset_code !== code) {
            user.failed_reset_attempts = (user.failed_reset_attempts || 0) + 1;
            if (user.failed_reset_attempts >= 3) {
                const lockTime = new Date();
                lockTime.setHours(lockTime.getHours() + 1);
                user.reset_locked_until = lockTime;
                await this.userRepo.save(user);
                throw new common_1.HttpException(`Demasiados intentos fallidos. Recuperación bloqueada por 1 hora.`, common_1.HttpStatus.FORBIDDEN);
            }
            await this.userRepo.save(user);
            throw new common_1.HttpException(`Código de seguridad incorrecto. Intento ${user.failed_reset_attempts}/3`, common_1.HttpStatus.BAD_REQUEST);
        }
        if (new Date() > new Date(user.reset_expires_at)) {
            throw new common_1.HttpException('El código de seguridad ha expirado', common_1.HttpStatus.BAD_REQUEST);
        }
        return { success: true };
    }
    async resetPassword(email, code, newPass) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user || user.reset_code !== code || new Date() > new Date(user.reset_expires_at)) {
            throw new common_1.HttpException('Petición de restablecimiento inválida o expirada', common_1.HttpStatus.BAD_REQUEST);
        }
        user.password_hash = newPass;
        user.reset_code = null;
        user.reset_expires_at = null;
        user.failed_reset_attempts = 0;
        user.reset_locked_until = null;
        await this.userRepo.save(user);
        return { success: true };
    }
    async unlockAccount(token) {
        const user = await this.userRepo.findOne({ where: { unlock_token: token } });
        if (!user) {
            throw new common_1.HttpException('Enlace inválido o expirado.', common_1.HttpStatus.BAD_REQUEST);
        }
        user.failed_login_attempts = 0;
        user.login_locked_until = null;
        user.failed_reset_attempts = 0;
        user.reset_locked_until = null;
        user.unlock_token = null;
        await this.userRepo.save(user);
        return { success: true };
    }
};
exports.PortalService = PortalService;
exports.PortalService = PortalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_user_entity_1.CustomerUser)),
    __param(1, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        mail_service_1.MailService])
], PortalService);
//# sourceMappingURL=portal.service.js.map