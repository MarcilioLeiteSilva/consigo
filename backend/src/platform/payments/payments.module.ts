import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AsaasService } from './asaas.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [PaymentsService, AsaasService],
  exports: [PaymentsService, AsaasService],
})
export class PaymentsModule {}
