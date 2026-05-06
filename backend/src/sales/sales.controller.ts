import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar uma nova venda' })
  create(@CurrentUser() user: any, @Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(user.tenantId, user.id, createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar histórico de vendas' })
  findAll(@CurrentUser() user: any) {
    return this.salesService.findAll(user.tenantId);
  }

  @Get('stock')
  @ApiOperation({ summary: 'Consultar estoque consolidado' })
  getStock(@CurrentUser() user: any) {
    return this.salesService.getStock(user.tenantId);
  }
}
