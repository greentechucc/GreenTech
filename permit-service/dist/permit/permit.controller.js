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
exports.PermitController = void 0;
const common_1 = require("@nestjs/common");
const permit_service_1 = require("./permit.service");
let PermitController = class PermitController {
    permitService;
    constructor(permitService) {
        this.permitService = permitService;
    }
    findAll() {
        return this.permitService.findAll();
    }
    getDictionary() {
        return this.permitService.getUtilityRequirements();
    }
    getDictionaryForCompany(company) {
        return this.permitService.getRequirementsForCompany(company);
    }
    findOne(id) {
        return this.permitService.findOne(+id);
    }
    create(createPermitDto) {
        return this.permitService.create(createPermitDto);
    }
    updateStatus(id, body) {
        return this.permitService.updateStatus(+id, body.status, body.reason);
    }
    async update(id, updateData) {
        return this.permitService.update(+id, updateData);
    }
    async remove(id) {
        return this.permitService.remove(+id);
    }
};
exports.PermitController = PermitController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermitController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dictionary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermitController.prototype, "getDictionary", null);
__decorate([
    (0, common_1.Get)('dictionary/:company'),
    __param(0, (0, common_1.Param)('company')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PermitController.prototype, "getDictionaryForCompany", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PermitController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PermitController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PermitController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PermitController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermitController.prototype, "remove", null);
exports.PermitController = PermitController = __decorate([
    (0, common_1.Controller)('permits'),
    __metadata("design:paramtypes", [permit_service_1.PermitService])
], PermitController);
//# sourceMappingURL=permit.controller.js.map