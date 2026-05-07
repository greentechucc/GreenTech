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
exports.PortalController = void 0;
const common_1 = require("@nestjs/common");
const portal_service_1 = require("./portal.service");
let PortalController = class PortalController {
    portalService;
    constructor(portalService) {
        this.portalService = portalService;
    }
    getAllUsers() {
        return this.portalService.getAllUsers();
    }
    deleteUser(id) {
        return this.portalService.deleteUser(+id);
    }
    register(data) {
        return this.portalService.register(data);
    }
    login(credentials) {
        return this.portalService.login(credentials.email, credentials.password);
    }
    refreshToken(body) {
        return this.portalService.refreshToken(body.refresh_token);
    }
    getDashboard(customerEmail) {
        return this.portalService.getCustomerDashboard(customerEmail);
    }
    createTicket(data) {
        return this.portalService.createTicket(data);
    }
    getTickets(customerEmail) {
        return this.portalService.getTickets(customerEmail);
    }
    getAllTickets() {
        return this.portalService.getAllTickets();
    }
    respondTicket(id, body) {
        return this.portalService.respondTicket(id, body.resolution, body.assigned_to);
    }
    closeTicket(id) {
        return this.portalService.closeTicket(id);
    }
    getProfile(email) {
        return this.portalService.getProfile(email);
    }
    updateContact(body) {
        return this.portalService.updateContact(body.email, body.phone, body.address, body.name);
    }
    updatePassword(body) {
        return this.portalService.updatePassword(body.email, body.currentPass, body.newPass);
    }
    updateAvatar(body) {
        return this.portalService.updateAvatar(body.email, body.avatarDataUrl);
    }
    forgotPassword(body) {
        return this.portalService.forgotPassword(body.email);
    }
    verifyResetCode(body) {
        return this.portalService.verifyResetCode(body.email, body.code);
    }
    resetPassword(body) {
        return this.portalService.resetPassword(body.email, body.code, body.newPass);
    }
    unlockAccount(body) {
        return this.portalService.unlockAccount(body.token);
    }
};
exports.PortalController = PortalController;
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('auth/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('auth/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('dashboard/:customerEmail'),
    __param(0, (0, common_1.Param)('customerEmail')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('tickets'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)('tickets/:customerEmail'),
    __param(0, (0, common_1.Param)('customerEmail')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getTickets", null);
__decorate([
    (0, common_1.Get)('tickets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getAllTickets", null);
__decorate([
    (0, common_1.Put)('tickets/:id/respond'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "respondTicket", null);
__decorate([
    (0, common_1.Put)('tickets/:id/close'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "closeTicket", null);
__decorate([
    (0, common_1.Get)('profile/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile/contact'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "updateContact", null);
__decorate([
    (0, common_1.Put)('profile/password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Put)('profile/photo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "updateAvatar", null);
__decorate([
    (0, common_1.Post)('auth/forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('auth/verify-reset-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "verifyResetCode", null);
__decorate([
    (0, common_1.Post)('auth/reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('auth/unlock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "unlockAccount", null);
exports.PortalController = PortalController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [portal_service_1.PortalService])
], PortalController);
//# sourceMappingURL=portal.controller.js.map