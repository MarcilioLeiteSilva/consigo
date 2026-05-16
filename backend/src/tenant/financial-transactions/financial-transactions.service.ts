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

  async createExpense(tenantId: string, dto: {
    amount: number;
    description: string;
    category: string;
  }) {
    return this.prisma.financialTransaction.create({
      data: {
        tenantId,
        type: 'DEBIT',
        referenceType: 'MANUAL',
        amount: dto.amount,
        description: dto.description,
        category: dto.category,
      },
    });
  }

  async getCashFlow(tenantId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await this.prisma.financialTransaction.findMany({
      where: { tenantId, createdAt: { gte: startDate, lt: endDate } },
      orderBy: { createdAt: 'asc' },
    });

    const entradas = transactions.filter((t) => t.type === 'CREDIT');
    const saidas = transactions.filter((t) => t.type === 'DEBIT');

    const totalEntradas = entradas.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalSaidas = saidas.reduce((acc, t) => acc + Number(t.amount), 0);
    const saldo = totalEntradas - totalSaidas;

    // Saídas agrupadas por categoria
    const saidasPorCategoria: Record<string, number> = {};
    saidas.forEach((t) => {
      const cat = t.category || 'Outros';
      saidasPorCategoria[cat] = (saidasPorCategoria[cat] || 0) + Number(t.amount);
    });

    return {
      month,
      year,
      totalEntradas,
      totalSaidas,
      saldo,
      entradas: entradas.map((t) => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        category: t.category,
        createdAt: t.createdAt,
      })),
      saidas: saidas.map((t) => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        category: t.category || 'Outros',
        createdAt: t.createdAt,
      })),
      saidasPorCategoria: Object.entries(saidasPorCategoria).map(([name, value]) => ({ name, value })),
    };
  }
}
