import { Module } from '@nestjs/common';
import { ConsignmentLotsService } from './consignment-lots.service';
import { ConsignmentLotsController } from './consignment-lots.controller';

@Module({
  controllers: [ConsignmentLotsController],
  providers: [ConsignmentLotsService],
})
export class ConsignmentLotsModule {}
