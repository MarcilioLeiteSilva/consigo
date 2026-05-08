import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinancialTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.financialTransaction.findMany({
      where: {
        tenantId,
      },
      include: {
        tenant: { select: { companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
