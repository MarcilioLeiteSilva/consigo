import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { PosModule } from './pos/pos.module';
import { ConsignmentLotsModule } from './consignment-lots/consignment-lots.module';
import { SalesModule } from './sales/sales.module';
import { OperationLogsModule } from './operation-logs/operation-logs.module';
import { FinancialTransactionsModule } from './financial-transactions/financial-transactions.module';
import { ConsignorAccountsModule } from './consignor-accounts/consignor-accounts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettlementsModule } from './settlements/settlements.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    PosModule,
    ConsignmentLotsModule,
    SalesModule,
    OperationLogsModule,
    FinancialTransactionsModule,
    ConsignorAccountsModule,
    DashboardModule,
    SettlementsModule,
    WhatsAppModule,
    ProfileModule,
  ],
})
export class TenantModule {}
