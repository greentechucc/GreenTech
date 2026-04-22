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
const typeorm_2 = require("typeorm");
const axios_1 = __importDefault(require("axios"));
let PortalService = class PortalService {
    userRepo;
    PROJECT_API = 'http://localhost:3003';
    MONITORING_API = 'http://localhost:3007';
    BILLING_API = 'http://localhost:3008';
    constructor(userRepo) {
        this.userRepo = userRepo;
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
        return { success: true, email: saved.email, name: saved.name };
    }
    async login(email, password) {
        const user = await this.userRepo.findOneBy({ email });
        if (!user || user.password_hash !== password) {
            throw new common_1.HttpException('Invalid credentials', common_1.HttpStatus.UNAUTHORIZED);
        }
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
};
exports.PortalService = PortalService;
exports.PortalService = PortalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_user_entity_1.CustomerUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PortalService);
//# sourceMappingURL=portal.service.js.map