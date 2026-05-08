import { Module } from '@nestjs/common';
import { ConsignorAccountsService } from './consignor-accounts.service';
import { ConsignorAccountsController } from './consignor-accounts.controller';

@Module({
  controllers: [ConsignorAccountsController],
  providers: [ConsignorAccountsService],
})
export class ConsignorAccountsModule {}
