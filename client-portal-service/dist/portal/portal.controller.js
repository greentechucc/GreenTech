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
    register(data) {
        return this.portalService.register(data);
    }
    login(credentials) {
        return this.portalService.login(credentials.email, credentials.password);
    }
    getDashboard(customerEmail) {
        return this.portalService.getCustomerDashboard(customerEmail);
    }
};
exports.PortalController = PortalController;
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
    (0, common_1.Get)('dashboard/:customerEmail'),
    __param(0, (0, common_1.Param)('customerEmail')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getDashboard", null);
exports.PortalController = PortalController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [portal_service_1.PortalService])
], PortalController);
//# sourceMappingURL=portal.controller.js.map