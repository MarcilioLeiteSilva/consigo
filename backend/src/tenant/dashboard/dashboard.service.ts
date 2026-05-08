import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly CACHE_TTL = 300; // 5 minutos

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getSalesSummary(tenantId: string) {
    const cacheKey = `dashboard:sales:${tenantId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const sales = await this.prisma.sale.aggregate({
      where: { tenantId },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const itemsCount = await this.prisma.saleItem.aggregate({
      where: { tenantId },
      _sum: { quantity: true },
    });

    const totalSales = Number(sales._sum.totalAmount || 0);
    const saleCount = sales._count.id || 0;
    const totalItems = itemsCount._sum.quantity || 0;
    const ticketMedio = saleCount > 0 ? totalSales / saleCount : 0;

    const result = {
      totalSales,
      saleCount,
      totalItems,
      ticketMedio,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  async getTopConsignors(tenantId: string) {
    // Agora que o Tenant é o consignador único, transformamos isso em Top Products
    // para não quebrar o frontend, mas com dados de produtos.
    const cacheKey = `dashboard:top-products:${tenantId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const result = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: { tenantId },
      _sum: { quantity: true, consignorAmount: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const hydrated = await Promise.all(
      result.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          consignorId: item.productId, // Mantemos a chave para compatibilidade
          name: product?.name || 'Desconhecido',
          totalGenerated: Number(item._sum.consignorAmount || 0),
          itemsSold: item._sum.quantity || 0,
        };
      }),
    );

    await this.redis.set(cacheKey, JSON.stringify(hydrated), this.CACHE_TTL);
    return hydrated;
  }

  async getFinancialSummary(tenantId: string) {
    const cacheKey = `dashboard:financial:${tenantId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const account = await this.prisma.consignorAccount.findUnique({
      where: { tenantId },
    });

    const payouts = await this.prisma.financialTransaction.aggregate({
      where: { tenantId, type: TransactionType.DEBIT },
      _sum: { amount: true },
    });

    const result = {
      pendingBalance: Number(account?.balance || 0),
      totalPaid: Number(payouts._sum.amount || 0),
      totalValueManaged: Number(account?.balance || 0) + Number(payouts._sum.amount || 0),
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }

  async getSlowProducts(tenantId: string) {
    const cacheKey = `dashboard:slow-products:${tenantId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const slowLots = await this.prisma.consignmentLot.findMany({
      where: {
        tenantId,
        closedAt: null,
        receivedAt: { lte: thirtyDaysAgo },
      },
      include: {
        product: { select: { name: true } },
      },
      take: 10,
    });

    const result = slowLots.map(lot => {
      const stock = lot.quantityReceived - lot.quantitySold - lot.quantityReturned;
      const daysInStock = Math.floor((Date.now() - new Date(lot.receivedAt).getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        productId: lot.productId,
        productName: lot.product.name,
        consignorName: 'Próprio',
        currentStock: stock,
        daysInStock,
        turnoverRate: lot.quantityReceived > 0 ? (lot.quantitySold / lot.quantityReceived) : 0,
      };
    }).sort((a, b) => a.turnoverRate - b.turnoverRate);

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    return result;
  }
}
