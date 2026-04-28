"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalModule = void 0;
const common_1 = require("@nestjs/common");
const portal_controller_1 = require("./portal.controller");
const portal_service_1 = require("./portal.service");
const mail_service_1 = require("./mail.service");
const typeorm_1 = require("@nestjs/typeorm");
const customer_user_entity_1 = require("./customer-user.entity");
const ticket_entity_1 = require("./ticket.entity");
let PortalModule = class PortalModule {
};
exports.PortalModule = PortalModule;
exports.PortalModule = PortalModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([customer_user_entity_1.CustomerUser, ticket_entity_1.Ticket])],
        controllers: [portal_controller_1.PortalController],
        providers: [portal_service_1.PortalService, mail_service_1.MailService],
    })
], PortalModule);
//# sourceMappingURL=portal.module.js.map