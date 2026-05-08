import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { TransactionType, FinancialReferenceType } from '@prisma/client';

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
      let totalValue = 0;
      const saleItemsToCreate: any[] = [];

      for (const item of dto.items) {
        let remainingToSell = item.quantity;

        // Buscar lotes com estoque disponível
        const lots = await tx.consignmentLot.findMany({
          where: {
            productId: item.productId,
            tenantId,
            closedAt: null,
          },
          orderBy: { receivedAt: 'asc' }, // FIFO
        });

        const totalAvailable = lots.reduce((acc, lot) => {
          return acc + (Number(lot.quantityReceived) - Number(lot.quantitySold) - Number(lot.quantityReturned));
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
          const itemTotal = quantityFromThisLot * Number(item.unitPrice);
          totalValue += itemTotal;

          // Atualizar estoque no lote
          await tx.consignmentLot.update({
            where: { id: lot.id },
            data: { quantitySold: { increment: quantityFromThisLot } },
          });

          // --- LÓGICA FINANCEIRA (Fase 3) ---
          // Calcular valor devido ao consignador (Repasse = Total - Comissão)
          const commissionPercent = Number(lot.commissionPercent);
          const commissionAmount = (itemTotal * commissionPercent) / 100;
          const amountDueToConsignor = itemTotal - commissionAmount;

          // Atualizar Saldo do Consignador (Atomic Increment)
          await tx.consignorAccount.update({
            where: { consignorId: lot.consignorId },
            data: { balance: { increment: amountDueToConsignor } },
          });

          // Registrar Transação Financeira
          await tx.financialTransaction.create({
            data: {
              tenantId,
              consignorId: lot.consignorId,
              type: TransactionType.CREDIT,
              amount: amountDueToConsignor,
              referenceType: FinancialReferenceType.SALE,
              description: `Venda de ${quantityFromThisLot} un de ${item.productId} (Lote: ${lot.id})`,
            },
          });

          saleItemsToCreate.push({
            productId: item.productId,
            consignorId: lot.consignorId,
            consignmentLotId: lot.id,
            quantity: quantityFromThisLot,
            unitPrice: item.unitPrice,
            totalItem: itemTotal,
          });

          remainingToSell -= quantityFromThisLot;
        }
      }

      // Criar a Venda
      const sale = await tx.sale.create({
        data: {
          tenantId,
          posId: dto.posId,
          totalValue,
          items: {
            create: saleItemsToCreate,
          },
        },
        include: { items: true },
      });

      // Vincular as transações financeiras à venda criada (opcional, mas bom para rastreio)
      await tx.financialTransaction.updateMany({
        where: { 
          tenantId, 
          description: { contains: `Venda de` }, 
          createdAt: { gte: new Date(Date.now() - 10000) } // Filtro temporal simples para o mock
        },
        data: { referenceId: sale.id }
      });

      // Log da operação
      await tx.operationLog.create({
        data: {
          tenantId,
          userId,
          action: 'CREATE_SALE',
          module: 'SALES',
          details: { saleId: sale.id, totalValue },
        },
      });

      return sale;
    });
  }

  findAll(tenantId: string) {
    return this.prisma.sale.findMany({
      where: { tenantId },
      include: {
        items: { include: { product: true, consignor: true } },
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
}
