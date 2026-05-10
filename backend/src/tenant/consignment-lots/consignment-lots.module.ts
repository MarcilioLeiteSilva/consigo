import { Module } from '@nestjs/common';
import { ConsignmentLotsService } from './consignment-lots.service';
import { ConsignmentLotsController } from './consignment-lots.controller';

import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [SalesModule],
  controllers: [ConsignmentLotsController],
  providers: [ConsignmentLotsService],
})
export class ConsignmentLotsModule {}
