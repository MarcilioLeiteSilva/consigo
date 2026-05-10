import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto, InventorySettlementDto } from './dto/create-settlement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settlements')
@UseGuards(JwtAuthGuard)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get('pending-pos')
  getPendingPOS(@Request() req) {
    return this.settlementsService.getPendingPOS(req.user.tenantId);
  }

  @Get('pending-items/:posId')
  getPendingItems(@Request() req, @Param('posId') posId: string) {
    return this.settlementsService.getPendingItems(req.user.tenantId, posId);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateSettlementDto) {
    return this.settlementsService.create(req.user.tenantId, dto);
  }

  @Get('active-lots/:posId')
  getActiveLots(@Request() req, @Param('posId') posId: string) {
    return this.settlementsService.getActiveLotsByPos(req.user.tenantId, posId);
  }

  @Post('inventory-based')
  createFromInventory(@Request() req, @Body() dto: InventorySettlementDto) {
    return this.settlementsService.createFromInventory(req.user.tenantId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.settlementsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.settlementsService.findOne(req.user.tenantId, id);
  }
}
