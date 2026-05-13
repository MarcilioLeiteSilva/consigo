import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly agentUrl: string;
  private readonly agentKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.agentUrl = this.configService.get<string>('WHATSAPP_AGENT_URL');
    this.agentKey = this.configService.get<string>('WHATSAPP_AGENT_KEY');
  }

  private async callAgent(path: string, method: string = 'GET', body?: any) {
    if (!this.agentUrl || !this.agentKey) {
      throw new InternalServerErrorException('WhatsApp Agent not configured');
    }

    const url = `${this.agentUrl.replace(/\/$/, '')}${path}`;
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Integration-Key': this.agentKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new BadRequestException(error.detail || 'Agent API Error');
      }

      return await response.json();
    } catch (e) {
      this.logger.error(`Error calling WhatsApp Agent: ${e.message}`);
      throw e;
    }
  }

  async getConfig(tenantId: string) {
    return this.prisma.whatsAppConfig.findUnique({
      where: { tenantId },
    });
  }

  async connect(tenantId: string, companyName: string) {
    let config = await this.getConfig(tenantId);
    
    const instanceName = config?.instanceName || `consigo_${tenantId.split('-')[0]}_${Date.now()}`;

    // Criar/Garantir instância no Agent
    const result = await this.callAgent('/v1/integration/instances', 'POST', {
      client_id: tenantId,
      client_name: companyName,
      instance_name: instanceName,
    });

    // Salvar no DB local
    if (!config) {
      config = await this.prisma.whatsAppConfig.create({
        data: {
          tenantId,
          instanceName,
          status: 'connecting',
        },
      });
    } else {
      config = await this.prisma.whatsAppConfig.update({
        where: { tenantId },
        data: { status: 'connecting' },
      });
    }

    return {
      ...config,
      qrcode: result.qrcode,
    };
  }

  async getStatus(tenantId: string) {
    const config = await this.getConfig(tenantId);
    if (!config) return { status: 'not_configured' };

    try {
      const result = await this.callAgent(`/v1/integration/instances/${config.instanceName}/status`);
      const status = result.instance?.state === 'open' ? 'connected' : 'disconnected';
      
      if (status !== config.status) {
        await this.prisma.whatsAppConfig.update({
          where: { tenantId },
          data: { status },
        });
      }

      return { ...config, ...result, status };
    } catch (e) {
      return { ...config, status: 'error', error: e.message };
    }
  }

  async getQrCode(tenantId: string) {
    const config = await this.getConfig(tenantId);
    if (!config) throw new BadRequestException('WhatsApp not configured');

    return this.callAgent(`/v1/integration/instances/${config.instanceName}/qr`);
  }

  async disconnect(tenantId: string) {
    const config = await this.getConfig(tenantId);
    if (!config) return { ok: true };

    await this.callAgent(`/v1/integration/instances/${config.instanceName}`, 'DELETE');
    
    await this.prisma.whatsAppConfig.delete({
      where: { tenantId },
    });

    return { ok: true };
  }

  async startInventoryFlow(tenantId: string, data: { posId: string, closingId: number, message: string }) {
    const config = await this.getConfig(tenantId);
    if (!config || config.status !== 'connected') {
      throw new BadRequestException('WhatsApp not connected');
    }

    const pos = await this.prisma.pOS.findUnique({ where: { id: data.posId } });
    if (!pos || !pos.whatsapp) {
      throw new BadRequestException('PDV does not have a WhatsApp number');
    }

    // Formata o número (garantir DDI e remover caracteres)
    let phone = pos.whatsapp.replace(/\D/g, '');
    if (!phone.startsWith('55')) phone = '55' + phone;

    return this.callAgent('/v1/integration/agents/inventory/start', 'POST', {
      instance_name: config.instanceName,
      pdv_phone: phone,
      closing_id: data.closingId,
      message: data.message,
    });
  }
}
