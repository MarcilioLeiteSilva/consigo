import { Controller, Post, Body, Logger, Headers, UnauthorizedException } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { ConfigService } from '@nestjs/config';
import { SettlementsService } from '../settlements/settlements.service';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly settlementsService: SettlementsService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Post('inventory')
  async handleInventoryResult(
    @Headers('x-integration-key') key: string,
    @Body() payload: any
  ) {
    // Validação do segredo
    const secret = this.configService.get<string>('WHATSAPP_AGENT_KEY');
    if (key !== secret) {
      throw new UnauthorizedException('Invalid webhook key');
    }

    this.logger.log(`Received inventory result from WhatsApp: ${JSON.stringify(payload)}`);
    
    if (payload.event === 'inventory_result') {
      const { instance_name, pdv_phone, items, notes } = payload;

      // 1. Identificar o Tenant
      const config = await this.whatsappService.getConfigByInstance(instance_name);
      if (!config) {
        this.logger.error(`Tenant not found for instance: ${instance_name}`);
        return { ok: false, error: 'Tenant not found' };
      }

      // 2. Identificar o PDV (limpar o telefone para busca)
      const cleanPhone = pdv_phone.replace(/\D/g, '');
      const pos = await this.prisma.pOS.findFirst({
        where: {
          tenantId: config.tenantId,
          whatsapp: { contains: cleanPhone.substring(cleanPhone.length - 8) } // Busca flexível pelos últimos dígitos
        }
      });

      if (!pos) {
        this.logger.error(`PDV not found for phone: ${pdv_phone} in tenant ${config.tenantId}`);
        return { ok: false, error: 'PDV not found' };
      }

      // 3. Processar os itens e criar o acerto
      try {
        const settlement = await this.settlementsService.createFromInventory(config.tenantId, {
          posId: pos.id,
          notes: notes || `Acerto automático processado via Agente de Acerto WhatsApp (Ref: ${new Date().toLocaleDateString('pt-BR')})`,
          items: items.map(item => ({
            lotId: item.lot_id,
            remainingQuantity: Number(item.remaining)
          }))
        });

        this.logger.log(`Settlement ${settlement.id} created automatically via Agent for POS ${pos.name}`);
        return { ok: true, settlementId: settlement.id };
      } catch (err) {
        this.logger.error(`Failed to create settlement from agent result: ${err.message}`);
        return { ok: false, error: err.message };
      }
    }

    return { ok: true };
  }
}
