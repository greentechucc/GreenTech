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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
let BillingController = class BillingController {
    billingService;
    constructor(billingService) {
        this.billingService = billingService;
    }
    findAll() {
        return this.billingService.findAll();
    }
    createInvoice(data) {
        return this.billingService.generateMilestones(data.projectId, data.customerId, data.amount, data.customer_name, data.concept);
    }
    generatePaymentLink(invoiceId) {
        const mockProviders = ['MercadoPago', 'Stripe'];
        const provider = mockProviders[Math.floor(Math.random() * mockProviders.length)];
        const id = Math.random().toString(36).substring(2, 15);
        return {
            link: `https://checkout.${provider.toLowerCase()}.com/pay/${id}`,
            provider,
            expires_in: '24h'
        };
    }
    recordPayment(invoiceId, data) {
        return this.billingService.recordPayment(+invoiceId, data.amount, data.method, data.transactionId);
    }
    update(id, body) {
        return this.billingService.update(Number(id), body);
    }
    remove(id) {
        return this.billingService.remove(Number(id));
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('invoices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('invoice'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Post)('invoice/:id/payment-link'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "generatePaymentLink", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Put)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "remove", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map