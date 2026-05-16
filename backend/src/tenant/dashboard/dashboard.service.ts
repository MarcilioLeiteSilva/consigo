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
      salesCountMonth: salesMetrics._count.id || 0,
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

  async getTopPos(tenantId: string) {
    const topPos = await this.prisma.sale.groupBy({
      by: ['posId'],
      where: { tenantId },
      _sum: { totalAmount: true },
      orderBy: {
        _sum: { totalAmount: 'desc' },
      },
      take: 5,
    });

    const results = await Promise.all(
      topPos.map(async (item) => {
        const pos = await this.prisma.pOS.findUnique({
          where: { id: item.posId },
          select: { name: true },
        });
        return {
          name: pos?.name || 'Desconhecido',
          sales: Number(item._sum.totalAmount || 0),
        };
      }),
    );

    return results;
  }

  async getSalesByCategory(tenantId: string) {
    const saleItems = await this.prisma.saleItem.findMany({
      where: { tenantId },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    const categoryMap: Record<string, number> = {};
    let total = 0;

    saleItems.forEach((item) => {
      const categoryName = item.product?.category?.name || 'Sem Categoria';
      const amount = Number(item.consignorAmount || 0);
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + amount;
      total += amount;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
  }

  async getTopProductsByPos(tenantId: string) {
    const saleItems = await this.prisma.saleItem.findMany({
      where: { tenantId },
      include: {
        product: { select: { name: true } },
        sale: { include: { pos: { select: { name: true } } } },
      },
    });

    const posMap: Record<string, Record<string, number>> = {};

    saleItems.forEach((item) => {
      const posName = item.sale?.pos?.name || 'Sem PDV';
      const productName = item.product?.name || 'Desconhecido';
      if (!posMap[posName]) posMap[posName] = {};
      posMap[posName][productName] = (posMap[posName][productName] || 0) + item.quantity;
    });

    return Object.entries(posMap).map(([pos, products]) => ({
      pos,
      products: Object.entries(products)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5),
    }));
  }

  async getAlerts(tenantId: string) {
    const alerts: Array<{
      type: string;
      severity: 'critical' | 'warning';
      title: string;
      description: string;
      link: string;
    }> = [];

    const now = new Date();
    const today = now.getDate();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Estoque Crítico (≤ 3 unidades)
    const lots = await this.prisma.consignmentLot.findMany({
      where: { tenantId, closedAt: null },
      select: {
        productId: true, posId: true,
        quantityReceived: true, quantitySold: true, quantityReturned: true,
        pos: { select: { name: true } },
        product: { select: { name: true } },
      },
    });
    const stockMap: Record<string, { available: number; posName: string; productName: string }> = {};
    lots.forEach((lot) => {
      const key = `${lot.productId}_${lot.posId}`;
      const available = lot.quantityReceived - (lot.quantitySold + lot.quantityReturned);
      if (!stockMap[key]) stockMap[key] = { available: 0, posName: lot.pos?.name || 'PDV', productName: lot.product?.name || 'Produto' };
      stockMap[key].available += available;
    });
    Object.values(stockMap).forEach(({ available, posName, productName }) => {
      if (available > 0 && available <= 3) {
        alerts.push({ type: 'ESTOQUE_CRITICO', severity: 'critical', title: 'Estoque Crítico',
          description: `"${productName}" com apenas ${available} un. em ${posName}.`, link: '/dashboard/inventory' });
      }
    });

    // 2. PDV Inadimplente (billingDay vencido 5+ dias + itens pendentes)
    const posWithBilling = await this.prisma.pOS.findMany({
      where: { tenantId, isActive: true, billingDay: { not: null } },
      select: { id: true, name: true, billingDay: true },
    });
    for (const pos of posWithBilling) {
      if (pos.billingDay && today > pos.billingDay + 5) {
        const pendingCount = await this.prisma.saleItem.count({
          where: { tenantId, settlementId: null, sale: { posId: pos.id } },
        });
        if (pendingCount > 0) {
          alerts.push({ type: 'PDV_INADIMPLENTE', severity: 'critical', title: 'PDV Inadimplente',
            description: `${pos.name}: ${pendingCount} itens pendentes, vencimento dia ${pos.billingDay}.`,
            link: '/dashboard/financial/receivables' });
        }
      }
    }

    // 3. PDV Inativo e PDV sem acerto há 30+ dias
    const allPos = await this.prisma.pOS.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });
    for (const pos of allPos) {
      const hasLots = await this.prisma.consignmentLot.count({ where: { tenantId, posId: pos.id } });
      if (hasLots === 0) continue;

      const recentSales = await this.prisma.sale.count({
        where: { tenantId, posId: pos.id, createdAt: { gte: thirtyDaysAgo } },
      });
      if (recentSales === 0) {
        alerts.push({ type: 'PDV_INATIVO', severity: 'warning', title: 'PDV Inativo',
          description: `${pos.name} não registrou vendas nos últimos 30 dias.`, link: '/dashboard/sales' });
      }

      const lastSettlement = await this.prisma.consignmentSettlement.findFirst({
        where: { tenantId, posId: pos.id }, orderBy: { settledAt: 'desc' },
      });
      if (!lastSettlement || new Date(lastSettlement.settledAt) < thirtyDaysAgo) {
        alerts.push({ type: 'SEM_ACERTO', severity: 'warning', title: 'Sem Acerto há 30+ dias',
          description: `${pos.name} não realizou fechamento nos últimos 30 dias.`, link: '/dashboard/settlements' });
      }
    }

    // 4. DRE Negativa
    const monthTx = await this.prisma.financialTransaction.findMany({ where: { tenantId, createdAt: { gte: monthStart } } });
    const rec = monthTx.filter((t) => t.type === 'CREDIT').reduce((acc, t) => acc + Number(t.amount), 0);
    const sai = monthTx.filter((t) => t.type === 'DEBIT').reduce((acc, t) => acc + Number(t.amount), 0);
    if (sai > 0 && rec - sai < 0) {
      alerts.push({ type: 'DRE_NEGATIVA', severity: 'warning', title: 'DRE Negativa',
        description: `Resultado do mês negativo: Receita R$ ${rec.toFixed(2)} vs Saídas R$ ${sai.toFixed(2)}.`,
        link: '/dashboard/financial/dre' });
    }

    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      alerts,
    };
  }

  async getDRE(tenantId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate, lt: endDate },
      },
    });

    const receita = transactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const saidas = transactions
      .filter((t) => t.type === 'DEBIT')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const resultado = receita - saidas;

    const settlements = await this.prisma.consignmentSettlement.count({
      where: {
        tenantId,
        settledAt: { gte: startDate, lt: endDate },
      },
    });

    const ticketMedio = settlements > 0 ? receita / settlements : 0;

    return {
      month,
      year,
      receita,
      saidas,
      resultado,
      settlements,
      ticketMedio,
    };
  }
}
