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
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./invoice.entity");
const payment_entity_1 = require("./payment.entity");
const ioredis_1 = __importDefault(require("ioredis"));
let BillingService = BillingService_1 = class BillingService {
    invoiceRepo;
    paymentRepo;
    logger = new common_1.Logger(BillingService_1.name);
    redisPub;
    redisSub;
    constructor(invoiceRepo, paymentRepo) {
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.redisPub = new ioredis_1.default({ host: 'localhost', port: 6379 });
        this.redisSub = new ioredis_1.default({ host: 'localhost', port: 6379 });
        this.initSubscriptions();
    }
    initSubscriptions() {
        this.redisSub.subscribe('project.stage.changed', (err) => {
            if (err)
                this.logger.error('Failed to subscribe', err);
        });
        this.redisSub.on('message', async (channel, message) => {
            if (channel === 'project.stage.changed') {
                const payload = JSON.parse(message);
                this.logger.log(`Received stage change for project ${payload.projectId}: ${payload.stage}`);
                if (payload.stage === 'INSTALLATION_STARTED') {
                    await this.generateMilestones(payload.projectId, payload.customerId, 5000);
                }
            }
        });
    }
    async findAll() {
        return this.invoiceRepo.find({ relations: ['payments'], order: { created_at: 'DESC' } });
    }
    async generateMilestones(projectId, customerId, totalAmount, customer_name, baseConcept) {
        const milestones = [
            { pct: 0.50, label: 'Anticipo (50%)', days: 5 },
            { pct: 0.40, label: 'Contra-entrega (40%)', days: 30 },
            { pct: 0.10, label: 'Conexión / Trámites (10%)', days: 60 }
        ];
        const invoices = [];
        let accumulated = 0;
        for (let i = 0; i < milestones.length; i++) {
            const m = milestones[i];
            const due = new Date();
            due.setDate(due.getDate() + m.days);
            const amount = i === milestones.length - 1 ? totalAmount - accumulated : Math.round(totalAmount * m.pct);
            accumulated += amount;
            const inv = this.invoiceRepo.create({
                project_id: projectId,
                customer_id: customerId,
                customer_name: customer_name || '',
                concept: `${baseConcept || 'Proyecto Solar'} - ${m.label}`,
                amount,
                due_date: due
            });
            invoices.push(inv);
        }
        await this.invoiceRepo.save(invoices);
        this.logger.log(`3 Milestones generated for Project ${projectId}`);
        return invoices;
    }
    async update(id, data) {
        const invoice = await this.invoiceRepo.findOneBy({ id });
        if (!invoice)
            return null;
        if (data.customer_name !== undefined)
            invoice.customer_name = data.customer_name;
        if (data.concept !== undefined)
            invoice.concept = data.concept;
        if (data.amount !== undefined)
            invoice.amount = data.amount;
        if (data.status !== undefined)
            invoice.status = data.status;
        return this.invoiceRepo.save(invoice);
    }
    async remove(id) {
        await this.paymentRepo.delete({ invoice_id: id });
        await this.invoiceRepo.delete(id);
        return { deleted: true };
    }
    async recordPayment(invoiceId, amount, method, transactionId) {
        const inv = await this.invoiceRepo.findOne({ where: { id: invoiceId }, relations: ['payments'] });
        if (!inv)
            throw new Error('Invoice not found');
        const payment = this.paymentRepo.create({
            invoice_id: invoiceId,
            amount,
            payment_method: method,
            transaction_id: transactionId
        });
        await this.paymentRepo.save(payment);
        const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
        if (totalPaid >= inv.amount) {
            await this.invoiceRepo.update(inv.id, {
                status: 'PAID',
                paid_at: new Date()
            });
        }
        this.redisPub.publish('payment.received', JSON.stringify({
            invoiceId,
            projectId: inv.project_id,
            amount
        }));
        return payment;
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BillingService);
//# sourceMappingURL=billing.service.js.map