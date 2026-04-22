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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permit = void 0;
const typeorm_1 = require("typeorm");
const permit_document_entity_1 = require("./permit-document.entity");
let Permit = class Permit {
    id;
    project_id;
    utility_company;
    permit_type;
    application_date;
    status;
    rejection_reason;
    approval_date;
    documents;
};
exports.Permit = Permit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Permit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Permit.prototype, "project_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Permit.prototype, "utility_company", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Permit.prototype, "permit_type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Permit.prototype, "application_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'NOT_STARTED' }),
    __metadata("design:type", String)
], Permit.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Permit.prototype, "rejection_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Permit.prototype, "approval_date", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => permit_document_entity_1.PermitDocument, document => document.permit, { cascade: true }),
    __metadata("design:type", Array)
], Permit.prototype, "documents", void 0);
exports.Permit = Permit = __decorate([
    (0, typeorm_1.Entity)('permits')
], Permit);
//# sourceMappingURL=permit.entity.js.map