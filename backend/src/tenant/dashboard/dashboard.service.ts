import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toPrismaDecimal, safeDivide, safeAdd } from '../../common/utils/prisma-decimal';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Vendas do Dia e do Mês
    const salesMetrics = await this.prisma.sale.aggregate({
      where: {
        tenantId,
        createdAt: { gte: monthStart },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const salesToday = await this.prisma.sale.aggregate({
      where: {
        tenantId,
        createdAt: { gte: today },
      },
      _sum: { totalAmount: true },
    });

    // 2. Ticket Médio (Mês)
    const totalSalesMonth = salesMetrics._sum.totalAmount || toPrismaDecimal(0);
    
    // Ticket Médio
    const salesCount = await this.prisma.sale.count({ where: { tenantId } });
    const avgTicket = salesCount > 0 ? safeDivide(totalSalesMonth, salesCount) : toPrismaDecimal(0);

    // 3. Saldo Financeiro (ConsignorAccount)
    const account = await this.prisma.consignorAccount.findUnique({
      where: { tenantId },
    });

    // 4. Estoque Total e Quantidade de PDVs
    const activePosCount = await this.prisma.pOS.count({
      where: { tenantId, isActive: true },
    });

    // Estoque total (soma de todos os lotes ativos)
    const stockQuantity = await this.prisma.consignmentLot.aggregate({
      where: {
        tenantId,
        quantityReceived: { gt: 0 }, // Simplificado para fins de performance
      },
      _sum: { 
        quantityReceived: true,
        quantitySold: true,
        quantityReturned: true,
      },
    });

    const totalStock = 
      (stockQuantity._sum.quantityReceived || 0) - 
      ((stockQuantity._sum.quantitySold || 0) + (stockQuantity._sum.quantityReturned || 0));

    // 5. Alertas de Estoque Baixo (Lotes com menos de 3 unidades)
    const lowStockLots = await this.prisma.consignmentLot.findMany({
      where: {
        tenantId,
        closedAt: null,
      },
      select: {
        id: true,
        productId: true,
        posId: true,
        quantityReceived: true,
        quantitySold: true,
        quantityReturned: true,
        pos: { select: { name: true } }
      }
    });

    // Agrupar por combinação de Produto + PDV para evitar falsos positivos
    const stockMap: Record<string, number> = {};
    lowStockLots.forEach(lot => {
      const key = `${lot.productId}_${lot.posId}`;
      const available = lot.quantityReceived - (lot.quantitySold + lot.quantityReturned);
      stockMap[key] = (stockMap[key] || 0) + available;
    });

    const criticalItems = Object.entries(stockMap).filter(([_, available]) => available > 0 && available <= 3);

    // Pega o PDV que tem mais itens críticos
    const posCounts: Record<string, number> = {};
    criticalItems.forEach(([key, _]) => {
      const posId = key.split('_')[1];
      const lot = lowStockLots.find(l => l.posId === posId);
      const name = lot?.pos?.name || 'PDV';
      posCounts[name] = (posCounts[name] || 0) + 1;
    });

    let topLowStockPos = 'PDVs';
    let maxCount = 0;
    Object.entries(posCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topLowStockPos = name;
      }
    });

    return {
      salesToday: salesToday._sum.totalAmount || 0,
      salesMonth: totalSalesMonth,
      avgTicket: avgTicket,
      totalStock,
      activePosCount,
      balance: account?.balance || 0,
      lowStockCount: criticalItems.length,
      lowStockPosName: topLowStockPos
    };
  }

  async getSalesByPeriod(tenantId: string, days: number = 7) {
    // Agregação de vendas nos últimos X dias para o gráfico
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days === 0 ? 1 : days)); // 0 means today, we take last 1 day
    if (days === 0) startDate.setHours(0, 0, 0, 0);

    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Agrupar por dia (isso pode ser otimizado via SQL bruto se houver volume alto)
    const chartData = sales.reduce((acc: Record<string, any>, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      acc[date] = safeAdd(acc[date] || 0, sale.totalAmount);
      return acc;
    }, {});

    return Object.entries(chartData).map(([date, total]) => ({ 
      date, 
      total: (total as any).toString() 
    }));
  }

  async getTopProducts(tenantId: string) {
    const topProducts = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: { tenantId },
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: 5,
    });

    const products = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          name: product?.name || 'Desconhecido',
          quantity: item._sum.quantity,
        };
      }),
    );

    return products;
  }
}
