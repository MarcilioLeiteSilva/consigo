import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { TransactionType, FinancialReferenceType } from '@prisma/client';
import { toPrismaDecimal, safeAdd } from '../../common/utils/prisma-decimal';

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingPOS(tenantId: string) {
    // Busca PDVs que possuem SaleItems não liquidados
    const pendingSales = await this.prisma.saleItem.findMany({
      where: {
        tenantId,
        settlementId: null,
      },
      select: {
        sale: {
          select: {
            posId: true,
          },
        },
      },
    });

    const posIds = [...new Set(pendingSales.map((s) => s.sale.posId))];

    const posList = await this.prisma.pOS.findMany({
      where: {
        id: { in: posIds },
        tenantId,
      },
      include: {
        _count: {
          select: {
            sales: {
              where: {
                items: {
                  some: { settlementId: null },
                },
              },
            },
          },
        },
      },
    });

    // Calcular valores pendentes para cada PDV
    const results = await Promise.all(
      posList.map(async (pos) => {
        const pendingItems = await this.prisma.saleItem.findMany({
          where: {
            tenantId,
            settlementId: null,
            sale: { posId: pos.id },
          },
        });

        const totalPending = pendingItems.reduce(
          (acc, item) => safeAdd(acc, item.consignorAmount),
          toPrismaDecimal(0),
        );

        return {
          ...pos,
          totalPending,
          pendingItemsCount: pendingItems.length,
        };
      }),
    );

    return results;
  }

  async getPendingItems(tenantId: string, posId: string) {
    return this.prisma.saleItem.findMany({
      where: {
        tenantId,
        settlementId: null,
        sale: { posId },
      },
      include: {
        product: { select: { name: true, sku: true } },
        sale: { select: { createdAt: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(tenantId: string, dto: CreateSettlementDto) {
    const { posId, notes, saleItemIds } = dto;

    // 1. Validar PDV
    const pos = await this.prisma.pOS.findFirst({
      where: { id: posId, tenantId },
    });
    if (!pos) throw new BadRequestException('PDV inválido');

    return await this.prisma.$transaction(async (tx) => {
      // 2. Buscar itens pendentes
      const pendingItems = await tx.saleItem.findMany({
        where: {
          tenantId,
          settlementId: null,
          sale: { posId },
          ...(saleItemIds ? { id: { in: saleItemIds } } : {}),
        },
      });

      if (pendingItems.length === 0) {
        throw new BadRequestException('Não há vendas pendentes para este fechamento');
      }

      // 3. Calcular total
      const totalAmount = pendingItems.reduce(
        (acc, item) => safeAdd(acc, item.consignorAmount),
        toPrismaDecimal(0),
      );

      // 4. Criar o Fechamento
      const settlement = await tx.consignmentSettlement.create({
        data: {
          tenantId,
          posId,
          totalAmount,
          notes,
          status: 'COMPLETED',
          settledAt: new Date(),
        },
      });

      // 5. Vincular itens ao fechamento
      await tx.saleItem.updateMany({
        where: {
          id: { in: pendingItems.map((i) => i.id) },
        },
        data: {
          settlementId: settlement.id,
        },
      });

      // 6. Registrar no Financeiro (se desejado integração automática)
      await tx.financialTransaction.create({
        data: {
          tenantId,
          type: TransactionType.CREDIT,
          amount: totalAmount,
          referenceType: FinancialReferenceType.SETTLEMENT,
          referenceId: settlement.id,
          description: `Fechamento de vendas - PDV: ${pos.name}`,
        },
      });

      // 7. Log
      await tx.operationLog.create({
        data: {
          tenantId,
          action: 'CREATE_SETTLEMENT',
          entity: 'SETTLEMENT',
          entityId: settlement.id,
          metadata: { posId, totalAmount, itemsCount: pendingItems.length },
        },
      });

      return settlement;
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.consignmentSettlement.findMany({
      where: { tenantId },
      include: { pos: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.consignmentSettlement.findFirst({
      where: { id, tenantId },
      include: {
        pos: true,
        saleItems: {
          include: { product: true },
        },
      },
    });
  }
}
