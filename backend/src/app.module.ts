import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ConsignorsModule } from './consignors/consignors.module';
import { ProductsModule } from './products/products.module';
import { PosModule } from './pos/pos.module';
import { ConsignmentLotsModule } from './consignment-lots/consignment-lots.module';
import { SalesModule } from './sales/sales.module';
import { OperationLogsModule } from './operation-logs/operation-logs.module';
import { FinancialTransactionsModule } from './financial-transactions/financial-transactions.module';
import { ConsignorAccountsModule } from './consignor-accounts/consignor-accounts.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    CommonModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    CategoriesModule,
    ConsignorsModule,
    ProductsModule,
    PosModule,
    ConsignmentLotsModule,
    SalesModule,
    OperationLogsModule,
    FinancialTransactionsModule,
    ConsignorAccountsModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
