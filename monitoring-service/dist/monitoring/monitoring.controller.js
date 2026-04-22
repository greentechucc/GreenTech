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
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const monitoring_service_1 = require("./monitoring.service");
let MonitoringController = class MonitoringController {
    monitoringService;
    constructor(monitoringService) {
        this.monitoringService = monitoringService;
    }
    ingestData(data) {
        return this.monitoringService.ingestTelemetry(data);
    }
    findAllInverters() {
        return this.monitoringService.findAllInverters();
    }
    createInverter(data) {
        return this.monitoringService.createInverter(data);
    }
    updateInverter(id, data) {
        return this.monitoringService.updateInverter(+id, data);
    }
    removeInverter(id) {
        return this.monitoringService.removeInverter(+id);
    }
    getDashboard(id) {
        return this.monitoringService.getDashboard(+id);
    }
    getSavings(id) {
        return this.monitoringService.calculateSavings(parseInt(id, 10));
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Post)('telemetry'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "ingestData", null);
__decorate([
    (0, common_1.Get)('inverters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "findAllInverters", null);
__decorate([
    (0, common_1.Post)('inverters'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "createInverter", null);
__decorate([
    (0, common_1.Put)('inverters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "updateInverter", null);
__decorate([
    (0, common_1.Delete)('inverters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "removeInverter", null);
__decorate([
    (0, common_1.Get)('dashboard/project/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('savings/project/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getSavings", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, common_1.Controller)('monitoring'),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map