import { Controller, Post, Body, Logger, Headers, UnauthorizedException } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly configService: ConfigService,
  ) {}

  @Post('inventory')
  async handleInventoryResult(
    @Headers('x-integration-key') key: string,
    @Body() payload: any
  ) {
    // Validação simples do segredo
    const secret = this.configService.get<string>('WHATSAPP_AGENT_KEY');
    if (key !== secret) {
      throw new UnauthorizedException('Invalid webhook key');
    }

    this.logger.log(`Received inventory result from WhatsApp: ${JSON.stringify(payload)}`);

    // Payload esperado:
    // { event: 'inventory_result', closing_id: 123, restantes: 32, avarias: 1, ... }
    
    if (payload.event === 'inventory_result') {
      // TODO: Aqui integraríamos com o serviço de Settlements para atualizar o rascunho do fechamento
      // Por enquanto, apenas logamos e confirmamos o recebimento
      this.logger.log(`Closing ID ${payload.closing_id} updated with ${payload.restantes} items remaining.`);
    }

    return { ok: true };
  }
}
