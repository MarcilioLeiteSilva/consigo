import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { TransactionType, FinancialReferenceType } from '@prisma/client';
import { toPrismaDecimal, safeAdd, safeMultiply, safeDivide, safeSubtract } from '../../common/utils/prisma-decimal';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateSaleDto) {
    // 1. Validar se o PDV pertence ao tenant
    const pos = await this.prisma.pOS.findFirst({
      where: { id: dto.posId, tenantId },
    });
    if (!pos) {
      throw new BadRequestException('Ponto de Venda inválido');
    }

    return await this.prisma.$transaction(async (tx) => {
      let totalAmount = toPrismaDecimal(0);
      const saleItemsToCreate: any[] = [];

      for (const item of dto.items) {
        let remainingToSell = item.quantity;

        // Buscar lotes com estoque disponível NO PDV ESPECÍFICO
        const lots = await tx.consignmentLot.findMany({
          where: {
            productId: item.productId,
            tenantId,
            posId: dto.posId, // Filtro por PDV
            closedAt: null,
          },
          orderBy: { receivedAt: 'asc' }, // FIFO
        });

        const totalAvailable = lots.reduce((acc, lot) => {
          const lotQty = Number(lot.quantityReceived) - Number(lot.quantitySold) - Number(lot.quantityReturned);
          return acc + lotQty;
        }, 0);

        if (totalAvailable < item.quantity) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          throw new BadRequestException(`Estoque insuficiente para: ${product?.name ?? item.productId}`);
        }

        for (const lot of lots) {
          if (remainingToSell <= 0) break;

          const lotAvailable = Number(lot.quantityReceived) - Number(lot.quantitySold) - Number(lot.quantityReturned);
          if (lotAvailable <= 0) continue;

          const quantityFromThisLot = Math.min(remainingToSell, lotAvailable);
          const itemTotal = safeMultiply(quantityFromThisLot, item.unitPrice);
          totalAmount = safeAdd(totalAmount, itemTotal);

          // Atualizar estoque no lote
          await tx.consignmentLot.update({
            where: { id: lot.id },
            data: { quantitySold: { increment: quantityFromThisLot } },
          });

          // --- LÓGICA FINANCEIRA SaaS ---
          const commissionPercent = toPrismaDecimal(lot.commissionPercent);
          const commissionAmount = safeDivide(safeMultiply(itemTotal, commissionPercent), 100);
          const consignorAmount = safeSubtract(itemTotal, commissionAmount);

          // Atualizar Saldo do Tenant (ConsignorAccount)
          await tx.consignorAccount.update({
            where: { tenantId },
            data: { balance: { increment: consignorAmount } },
          });

          // Registrar Transação Financeira
          await tx.financialTransaction.create({
            data: {
              tenantId,
              type: TransactionType.CREDIT,
              amount: consignorAmount,
              referenceType: FinancialReferenceType.SALE,
              description: `Venda de ${quantityFromThisLot} un de ${item.productId} (Lote: ${lot.id})`,
            },
          });

          saleItemsToCreate.push({
            tenantId,
            productId: item.productId,
            consignmentLotId: lot.id,
            quantity: quantityFromThisLot,
            unitPrice: toPrismaDecimal(item.unitPrice),
            commissionPercent: toPrismaDecimal(lot.commissionPercent),
            consignorAmount: consignorAmount,
          });

          remainingToSell -= quantityFromThisLot;
        }
      }

      // Criar a Venda
      const sale = await tx.sale.create({
        data: {
          tenantId,
          posId: dto.posId,
          totalAmount,
          createdBy: userId,
          items: {
            create: saleItemsToCreate,
          },
        },
        include: { items: true },
      });

      // Vincular as transações financeiras à venda criada
      await tx.financialTransaction.updateMany({
        where: { 
          tenantId, 
          description: { contains: `(Lote:` }, 
          createdAt: { gte: new Date(Date.now() - 30000) } 
        },
        data: { referenceId: sale.id }
      });

      // Log da operação
      await tx.operationLog.create({
        data: {
          tenantId,
          userId,
          action: 'CREATE_SALE',
          entity: 'SALE',
          entityId: sale.id,
          metadata: { totalAmount },
        },
      });

      return sale;
    });
  }

  findAll(tenantId: string) {
    return this.prisma.sale.findMany({
      where: { tenantId },
      include: {
        items: { include: { product: true } },
        pos: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStock(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: { consignmentLots: { where: { closedAt: null } } },
    });

    return products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      totalStock: p.consignmentLots.reduce((acc, lot) => acc + (lot.quantityReceived - lot.quantitySold - lot.quantityReturned), 0),
    }));
  }

  async getStockAlerts(tenantId: string) {
    const lots = await this.prisma.consignmentLot.findMany({
      where: {
        tenantId,
        closedAt: null,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        pos: { select: { id: true, name: true, city: true } },
      },
    });

    // Agrupar por combinação de Produto + PDV
    const stockMap: Record<string, any> = {};

    lots.forEach(lot => {
      const key = `${lot.productId}_${lot.posId}`;
      const available = lot.quantityReceived - (lot.quantitySold + lot.quantityReturned);
      
      if (!stockMap[key]) {
        stockMap[key] = {
          productId: lot.productId,
          productName: lot.product.name,
          productSku: lot.product.sku,
          posId: lot.posId,
          posName: lot.pos?.name || 'PDV Desconhecido',
          posCity: lot.pos?.city || 'Localização não inf.',
          totalAvailable: 0,
          lotId: lot.id, // Referência de um dos lotes para o link
        };
      }
      stockMap[key].totalAvailable += available;
    });

    const alerts = Object.values(stockMap)
      .map(item => ({
        id: item.lotId, // Link para a página de lotes
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        posName: item.posName,
        posCity: item.posCity,
        available: item.totalAvailable,
        posId: item.posId,
      }))
      .filter(a => a.available > 0 && a.available <= 3)
      .sort((a, b) => a.available - b.available);

    return alerts;
  }
}
