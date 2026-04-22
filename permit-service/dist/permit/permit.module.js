"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermitModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const permit_controller_1 = require("./permit.controller");
const permit_service_1 = require("./permit.service");
const permit_entity_1 = require("./permit.entity");
const permit_document_entity_1 = require("./permit-document.entity");
const utility_requirement_entity_1 = require("./utility-requirement.entity");
let PermitModule = class PermitModule {
};
exports.PermitModule = PermitModule;
exports.PermitModule = PermitModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([permit_entity_1.Permit, permit_document_entity_1.PermitDocument, utility_requirement_entity_1.UtilityRequirement])],
        controllers: [permit_controller_1.PermitController],
        providers: [permit_service_1.PermitService],
    })
], PermitModule);
//# sourceMappingURL=permit.module.js.map