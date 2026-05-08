import { PartialType } from '@nestjs/swagger';
import { CreateConsignorAccountDto } from './create-consignor-account.dto';

export class UpdateConsignorAccountDto extends PartialType(CreateConsignorAccountDto) {}
