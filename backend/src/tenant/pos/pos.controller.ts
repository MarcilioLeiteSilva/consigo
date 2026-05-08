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
import { PosService } from './pos.service';
import { CreatePoDto } from './dto/create-po.dto';
import { UpdatePoDto } from './dto/update-po.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('pos')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um ponto de venda' })
  create(@CurrentUser() user: any, @Body() createPoDto: CreatePoDto) {
    return this.posService.create(user.tenantId, createPoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pontos de venda' })
  findAll(@CurrentUser() user: any) {
    return this.posService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ponto de venda por ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.posService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ponto de venda' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updatePoDto: UpdatePoDto,
  ) {
    return this.posService.update(user.tenantId, id, updatePoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover ponto de venda' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.posService.remove(user.tenantId, id);
  }
}
