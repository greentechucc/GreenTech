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
exports.UtilityRequirement = void 0;
const typeorm_1 = require("typeorm");
let UtilityRequirement = class UtilityRequirement {
    id;
    utility_company;
    permit_type;
    required_documents;
    estimated_processing_days;
    additional_notes;
};
exports.UtilityRequirement = UtilityRequirement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UtilityRequirement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UtilityRequirement.prototype, "utility_company", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UtilityRequirement.prototype, "permit_type", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], UtilityRequirement.prototype, "required_documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 30 }),
    __metadata("design:type", Number)
], UtilityRequirement.prototype, "estimated_processing_days", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], UtilityRequirement.prototype, "additional_notes", void 0);
exports.UtilityRequirement = UtilityRequirement = __decorate([
    (0, typeorm_1.Entity)('utility_requirements')
], UtilityRequirement);
//# sourceMappingURL=utility-requirement.entity.js.map