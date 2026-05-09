import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toMoneyString } from '../utils/money';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Se já estiver no formato { data, meta }, transforma apenas o data
        if (data && typeof data === 'object' && 'data' in data) {
          return {
            ...data,
            data: this.transformDecimals(data.data),
          };
        }
        // Caso contrário, encapsula e transforma
        return { data: this.transformDecimals(data) };
      }),
    );
  }

  private transformDecimals(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDecimals(item));
    }

    if (typeof obj === 'object') {
      // Identifica se é um objeto Decimal (Prisma/decimal.js)
      // Em produção, constructor.name pode ser minificado, então usamos duck-typing
      const isDecimal = 
        obj.constructor?.name === 'Decimal' || 
        (obj.hasOwnProperty('d') && Array.isArray(obj.d) && obj.hasOwnProperty('e') && obj.hasOwnProperty('s'));

      if (isDecimal) {
        return toMoneyString(obj);
      }

      // Recursão para objetos aninhados (Date, etc. são mantidos)
      if (obj instanceof Date) return obj;

      const newObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = this.transformDecimals(obj[key]);
        }
      }
      return newObj;
    }

    return obj;
  }
}
