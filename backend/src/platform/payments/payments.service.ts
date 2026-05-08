import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AsaasService } from './asaas.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly asaasService: AsaasService,
  ) {}

  async create(tenantId: string, subscriptionId: string, amount: number) {
    // 1. Create payment in our DB
    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        subscriptionId,
        amount,
        method: 'BOLETO_PIX', // Example
        status: PaymentStatus.PENDING,
      },
    });

    // 2. Logic to generate link via Asaas could go here
    
    return payment;
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: { tenant: true, subscription: true },
    });
  }
}
