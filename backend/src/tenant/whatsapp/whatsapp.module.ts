import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppWebhookController } from './whatsapp.webhook.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SettlementsModule } from '../settlements/settlements.module';

@Module({
  imports: [PrismaModule, SettlementsModule],
  controllers: [WhatsAppController, WhatsAppWebhookController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
