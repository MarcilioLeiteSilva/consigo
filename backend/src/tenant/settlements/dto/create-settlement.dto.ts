import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, Min } from 'class-validator';

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

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}

export class InventorySettlementItemDto {
  @IsString()
  @IsNotEmpty()
  lotId: string;

  @IsNumber()
  @Min(0)
  remainingQuantity: number;
}

export class InventorySettlementDto {
  @IsString()
  @IsNotEmpty()
  posId: string;

  @IsArray()
  items: InventorySettlementItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}
