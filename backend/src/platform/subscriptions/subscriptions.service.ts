import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: { tenantId: string; planId: string }) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return this.prisma.subscription.create({
      data: {
        tenantId: dto.tenantId,
        planId: dto.planId,
        status: 'active',
        startDate: new Date(),
        // Simple logic: renewal in 30 days
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async findByTenant(tenantId: string) {
    return this.prisma.subscription.findFirst({
      where: { tenantId, status: 'active' },
      include: { plan: true },
    });
  }

  async findAll() {
    return this.prisma.subscription.findMany({
      include: { tenant: true, plan: true },
    });
  }
}
