import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit write operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const userId = request.headers['x-user-id'] || 'anonymous';
    const userEmail = request.headers['x-user-email'] || 'unknown';
    const userRole = request.headers['x-user-role'] || 'unknown';
    const path = request.path;
    const body = request.body;

    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const repo = this.dataSource.getRepository(AuditLog);
          const entityId = request.params?.id || responseData?.id || 'N/A';
          
          // Extract entity name from path
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
        } catch (err) {
          console.error('[Audit] Failed to log:', err.message);
        }
      }),
    );
  }
}
