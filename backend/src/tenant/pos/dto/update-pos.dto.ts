import { PartialType } from '@nestjs/swagger';
import { CreatePosDto } from './create-pos.dto';

export class UpdatePosDto extends PartialType(CreatePosDto) {}
