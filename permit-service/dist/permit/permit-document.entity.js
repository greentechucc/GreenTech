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
exports.PermitDocument = void 0;
const typeorm_1 = require("typeorm");
const permit_entity_1 = require("./permit.entity");
let PermitDocument = class PermitDocument {
    id;
    permit_id;
    permit;
    document_type;
    file_url;
    uploaded_at;
};
exports.PermitDocument = PermitDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PermitDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PermitDocument.prototype, "permit_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permit_entity_1.Permit, permit => permit.documents),
    (0, typeorm_1.JoinColumn)({ name: 'permit_id' }),
    __metadata("design:type", permit_entity_1.Permit)
], PermitDocument.prototype, "permit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PermitDocument.prototype, "document_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PermitDocument.prototype, "file_url", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PermitDocument.prototype, "uploaded_at", void 0);
exports.PermitDocument = PermitDocument = __decorate([
    (0, typeorm_1.Entity)('permit_documents')
], PermitDocument);
//# sourceMappingURL=permit-document.entity.js.map