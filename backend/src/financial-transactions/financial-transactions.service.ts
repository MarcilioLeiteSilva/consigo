import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, consignorId?: string) {
    return this.prisma.financialTransaction.findMany({
      where: {
        tenantId,
        ...(consignorId ? { consignorId } : {}),
      },
      include: {
        consignor: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
