import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AsaasService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('ASAAS_API_KEY') || '';
    this.baseUrl = this.config.get<string>('ASAAS_BASE_URL') || 'https://sandbox.asaas.com/api/v3';
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'access_token': this.apiKey,
    };
  }

  async createCustomer(data: { name: string; email: string; cpfCnpj: string }) {
    if (!this.apiKey) return { id: `mock_cust_${Date.now()}` };

    try {
      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(result));
      return result;
    } catch (error: any) {
      console.error('Asaas Customer Error:', error.message);
      throw new InternalServerErrorException('Erro ao criar cliente no Asaas');
    }
  }

  async createSubscription(customerId: string, plan: any) {
    if (!this.apiKey) return { id: `mock_sub_${Date.now()}` };

    const body = {
      customer: customerId,
      billingType: 'UNDEFINED', // Deixa o usuário escolher no checkout (Boleto, Pix, Cartão)
      value: plan.price,
      nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0], // 7 dias para o primeiro vencimento
      cycle: 'MONTHLY',
      description: `Assinatura Plano ${plan.name} - Consigo SaaS`,
    };

    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(result));
      return result;
    } catch (error: any) {
      console.error('Asaas Subscription Error:', error.message);
      throw new InternalServerErrorException('Erro ao criar assinatura no Asaas');
    }
  }
}
