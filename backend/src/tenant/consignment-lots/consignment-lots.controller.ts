import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConsignmentLotsService } from './consignment-lots.service';
import { CreateConsignmentLotDto } from './dto/create-consignment-lot.dto';
import { UpdateConsignmentLotDto } from './dto/update-consignment-lot.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RegisterReturnDto } from './dto/register-return.dto';
import { RegisterLossDto } from './dto/register-loss.dto';

@ApiTags('consignment-lots')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('consignment-lots')
export class ConsignmentLotsController {
  constructor(private readonly consignmentLotsService: ConsignmentLotsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um lote de consignação' })
  create(
    @CurrentUser() user: any,
    @Body() createConsignmentLotDto: CreateConsignmentLotDto,
  ) {
    return this.consignmentLotsService.create(user.tenantId, createConsignmentLotDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lotes de consignação' })
  findAll(@CurrentUser() user: any) {
    return this.consignmentLotsService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar lote por ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.consignmentLotsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar lote' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateConsignmentLotDto: UpdateConsignmentLotDto,
  ) {
    return this.consignmentLotsService.update(
      user.tenantId,
      id,
      updateConsignmentLotDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover lote' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.consignmentLotsService.remove(user.tenantId, id);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Registrar devolução de produtos para o estoque central' })
  registerReturn(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RegisterReturnDto,
  ) {
    return this.consignmentLotsService.registerReturn(user.tenantId, id, dto.quantity);
  }

  @Post(':id/loss')
  @ApiOperation({ summary: 'Registrar perda de produtos' })
  registerLoss(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RegisterLossDto,
  ) {
    return this.consignmentLotsService.registerLoss(user.tenantId, id, dto.quantity, dto.reason);
  }
}
