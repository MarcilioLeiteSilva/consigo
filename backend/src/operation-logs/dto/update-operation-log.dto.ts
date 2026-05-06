import { PartialType } from '@nestjs/swagger';
import { CreateOperationLogDto } from './create-operation-log.dto';

export class UpdateOperationLogDto extends PartialType(CreateOperationLogDto) {}
