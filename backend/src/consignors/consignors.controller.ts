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
import { ConsignorsService } from './consignors.service';
import { CreateConsignorDto } from './dto/create-consignor.dto';
import { UpdateConsignorDto } from './dto/update-consignor.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('consignors')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('consignors')
export class ConsignorsController {
  constructor(private readonly consignorsService: ConsignorsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um consignador' })
  create(@CurrentUser() user: any, @Body() createConsignorDto: CreateConsignorDto) {
    return this.consignorsService.create(user.tenantId, createConsignorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar consignadores' })
  findAll(@CurrentUser() user: any) {
    return this.consignorsService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar consignador por ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.consignorsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar consignador' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateConsignorDto: UpdateConsignorDto,
  ) {
    return this.consignorsService.update(user.tenantId, id, updateConsignorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover consignador' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.consignorsService.remove(user.tenantId, id);
  }
}
