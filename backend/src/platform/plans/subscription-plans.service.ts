import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.subscriptionPlan.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.subscriptionPlan.findMany();
  }

  async findOne(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(id: string, dto: any) {
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }
}
