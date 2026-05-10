import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateSettlementDto {
  @IsString()
  @IsNotEmpty()
  posId: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  saleItemIds?: string[]; // Opcional: se não enviado, fecha todas as vendas pendentes do PDV
}
