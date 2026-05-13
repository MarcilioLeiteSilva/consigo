import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { TransactionType, FinancialReferenceType } from '@prisma/client';
import { toPrismaDecimal, safeAdd, safeSubtract } from '../../common/utils/prisma-decimal';
import { InventorySettlementDto } from './dto/create-settlement.dto';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class SettlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesService: SalesService
  ) {}

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
    const { posId, notes, saleItemIds, startDate, endDate } = dto;

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
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
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

  async getActiveLotsByPos(tenantId: string, posId: string) {
    return this.prisma.consignmentLot.findMany({
      where: {
        tenantId,
        posId,
        closedAt: null,
      },
      include: {
        product: { select: { name: true, sku: true } },
      },
      orderBy: { receivedAt: 'asc' },
    });
  }

  async createFromInventory(tenantId: string, dto: InventorySettlementDto) {
    const { posId, items, notes, startDate, endDate } = dto;

    // 1. Validar PDV
    const pos = await this.prisma.pOS.findFirst({
      where: { id: posId, tenantId },
    });
    if (!pos) throw new BadRequestException('PDV inválido');

    return await this.prisma.$transaction(async (tx) => {
      const saleItemIds: string[] = [];

      for (const item of items) {
        // Buscar o lote
        const lot = await tx.consignmentLot.findUnique({
          where: { id: item.lotId },
        });

        if (!lot || lot.tenantId !== tenantId) {
          throw new BadRequestException(`Lote ${item.lotId} não encontrado`);
        }

        // Calcular quanto foi vendido desde o último acerto
        const currentTotalSold = Number(lot.quantitySold);
        const totalReceived = Number(lot.quantityReceived);
        const totalReturned = Number(lot.quantityReturned);
        const totalLost = Number(lot.quantityLost || 0);
        
        // Vendidos = Recebidos - Devolvidos - Perdidos - Restantes
        const theoreticalTotalSold = totalReceived - totalReturned - totalLost - item.remainingQuantity;
        const newlySold = theoreticalTotalSold - currentTotalSold;

        if (newlySold < 0) {
          throw new BadRequestException(`A contagem para o lote ${lot.id} indica um estoque maior do que o registrado.`);
        }

        if (newlySold > 0) {
          // Registrar a venda da diferença
          const sale = await this.salesService.create(tenantId, 'SYSTEM', {
            posId,
            items: [
              {
                productId: lot.productId,
                quantity: newlySold,
                unitPrice: lot.unitPrice?.toString() || '0'
              }
            ]
          });

          // Pegar os IDs dos itens de venda criados para vincular ao fechamento
          // Como usamos o salesService.create, ele já criou os SaleItems
          const createdItems = await tx.saleItem.findMany({
            where: { saleId: sale.id }
          });
          saleItemIds.push(...createdItems.map(i => i.id));
        }
      }

      if (saleItemIds.length === 0) {
        throw new BadRequestException('Não houve variação de estoque para gerar um fechamento');
      }

      // Agora criamos o fechamento real usando os itens que acabamos de "vender" por inventário
      return this.create(tenantId, {
        posId,
        notes: notes || 'Fechamento baseado em inventário',
        saleItemIds,
        startDate,
        endDate
      });
    });
  }
}
