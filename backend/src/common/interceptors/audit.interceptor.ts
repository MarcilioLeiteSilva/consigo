import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    // Apenas logar mutações
    const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
    
    // Evitar logar login (senha) ou rotas de leitura
    if (!isMutation || url.includes('/auth/login')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        if (user && user.tenantId) {
          try {
            await this.prisma.operationLog.create({
              data: {
                tenantId: user.tenantId,
                userId: user.id,
                action: `${method} ${url}`,
                module: url.split('/')[1] || 'GENERAL',
                details: {
                  requestBody: body,
                  response: data,
                },
              },
            });
          } catch (e) {
            console.error('Falha ao gravar log de auditoria:', e);
          }
        }
      }),
    );
  }
}
