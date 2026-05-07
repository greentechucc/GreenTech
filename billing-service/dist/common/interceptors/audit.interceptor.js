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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const typeorm_1 = require("typeorm");
const audit_log_entity_1 = require("../entities/audit-log.entity");
let AuditInterceptor = class AuditInterceptor {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle();
        }
        const userId = request.headers['x-user-id'] || 'anonymous';
        const userEmail = request.headers['x-user-email'] || 'unknown';
        const userRole = request.headers['x-user-role'] || 'unknown';
        const path = request.path;
        const body = request.body;
        const actionMap = {
            POST: 'CREATE',
            PUT: 'UPDATE',
            PATCH: 'UPDATE',
            DELETE: 'DELETE',
        };
        return next.handle().pipe((0, rxjs_1.tap)(async (responseData) => {
            try {
                const repo = this.dataSource.getRepository(audit_log_entity_1.AuditLog);
                const entityId = request.params?.id || responseData?.id || 'N/A';
                const pathParts = path.split('/').filter(Boolean);
                const entity = pathParts[0] || 'Unknown';
                await repo.save(repo.create({
                    user_id: userId,
                    user_email: userEmail,
                    user_role: userRole,
                    action: actionMap[method] || method,
                    entity: entity.charAt(0).toUpperCase() + entity.slice(1),
                    entity_id: String(entityId),
                    details: JSON.stringify({ path, body: method !== 'DELETE' ? body : undefined }),
                }));
            }
            catch (err) {
                console.error('[Audit] Failed to log:', err.message);
            }
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map