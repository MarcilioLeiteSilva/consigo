import { PartialType } from '@nestjs/swagger';
import { CreateConsignmentLotDto } from './create-consignment-lot.dto';

export class UpdateConsignmentLotDto extends PartialType(CreateConsignmentLotDto) {}
