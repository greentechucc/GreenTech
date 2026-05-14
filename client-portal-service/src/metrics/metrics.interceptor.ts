import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Counter, Histogram } from 'prom-client';

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const method = req.method;
    const route = req.route?.path || req.path || 'unknown';
    const start = Date.now();

    return next.handle().pipe(
      tap({
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
      }),
    );
  }
}
