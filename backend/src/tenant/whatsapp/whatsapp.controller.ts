import { Controller, Get, Post, Delete, Body, Request, UseGuards } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tenant/whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('status')
  async getStatus(@Request() req) {
    return this.whatsappService.getStatus(req.user.tenantId);
  }

  @Post('connect')
  async connect(@Request() req) {
    // Busca o nome da empresa para enviar ao Agent
    const tenant = await this.whatsappService.getConfig(req.user.tenantId);
    return this.whatsappService.connect(req.user.tenantId, req.user.tenantName || 'Consigo Tenant');
  }

  @Get('qr')
  async getQr(@Request() req) {
    return this.whatsappService.getQrCode(req.user.tenantId);
  }

  @Delete('disconnect')
  async disconnect(@Request() req) {
    return this.whatsappService.disconnect(req.user.tenantId);
  }

  @Post('settings')
  async updateSettings(@Request() req, @Body() data: { greetingMessage?: string, aiInstructions?: string }) {
    return this.whatsappService.updateSettings(req.user.tenantId, data);
  }

  @Post('inventory/start')
  async startInventory(@Request() req, @Body() data: { posId: string, closingId: number, message: string }) {
    return this.whatsappService.startInventoryFlow(req.user.tenantId, data);
  }
}
