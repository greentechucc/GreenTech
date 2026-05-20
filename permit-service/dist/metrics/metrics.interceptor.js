"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const prom_client_1 = require("prom-client");
const httpRequestsTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});
const httpRequestDuration = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
let MetricsInterceptor = class MetricsInterceptor {
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const method = req.method;
        const route = req.route?.path || req.path || 'unknown';
        const start = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                const duration = (Date.now() - start) / 1000;
                const statusCode = res.statusCode?.toString() || '200';
                httpRequestsTotal.inc({ method, route, status_code: statusCode });
                httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
            },
            error: (err) => {
                const duration = (Date.now() - start) / 1000;
                const statusCode = err?.status?.toString() || '500';
                httpRequestsTotal.inc({ method, route, status_code: statusCode });
                httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
            },
        }));
    }
};
exports.MetricsInterceptor = MetricsInterceptor;
exports.MetricsInterceptor = MetricsInterceptor = __decorate([
    (0, common_1.Injectable)()
], MetricsInterceptor);
//# sourceMappingURL=metrics.interceptor.js.map