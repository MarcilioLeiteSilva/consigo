import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsignmentLotDto } from './dto/create-consignment-lot.dto';
import { UpdateConsignmentLotDto } from './dto/update-consignment-lot.dto';
import { toPrismaDecimal } from '../../common/utils/prisma-decimal';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class ConsignmentLotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesService: SalesService
  ) {}

  async create(tenantId: string, createConsignmentLotDto: CreateConsignmentLotDto) {
    const { unitPrice, commissionPercent, isImmediateSale, ...rest } = createConsignmentLotDto;
    // Validar Produto
    const product = await this.prisma.product.findFirst({
      where: { id: createConsignmentLotDto.productId, tenantId },
    });
    if (!product) {
      throw new BadRequestException('Produto inválido ou não pertence ao tenant');
    }

    // Validar POS if provided
    if (createConsignmentLotDto.posId) {
      const pos = await this.prisma.pOS.findFirst({
        where: { id: createConsignmentLotDto.posId, tenantId },
      });
      if (!pos) {
        throw new BadRequestException('Ponto de Venda inválido ou não pertence ao tenant');
      }
    }

    // Início da Transação para garantir integridade do estoque
    return await this.prisma.$transaction(async (tx) => {
      // Se for uma reposição para PDV (posId presente), validar Estoque Geral
      if (createConsignmentLotDto.posId) {
        const generalLots = await tx.consignmentLot.findMany({
          where: {
            productId: createConsignmentLotDto.productId,
            tenantId,
            posId: null,
            closedAt: null,
          },
          orderBy: { receivedAt: 'asc' }, // FIFO
        });

        const totalGeneralStock = generalLots.reduce((acc, l) => {
          return acc + (l.quantityReceived - l.quantitySold - l.quantityReturned - (l.quantityLost || 0));
        }, 0);

        if (totalGeneralStock < createConsignmentLotDto.quantityReceived) {
          throw new BadRequestException(
            `Estoque insuficiente no Estoque Geral. Disponível: ${totalGeneralStock} unidades.`
          );
        }

        // Realizar a baixa no Estoque Geral (consumindo os lotes via FIFO)
        let remainingToTransfer = createConsignmentLotDto.quantityReceived;
        for (const genLot of generalLots) {
          if (remainingToTransfer <= 0) break;
          
          const availableInLot = genLot.quantityReceived - genLot.quantitySold - genLot.quantityReturned - (genLot.quantityLost || 0);
          if (availableInLot <= 0) continue;

          const amountFromThisLot = Math.min(remainingToTransfer, availableInLot);
          
          await tx.consignmentLot.update({
            where: { id: genLot.id },
            data: { 
              // Incrementamos quantitySold para 'bloquear' essas unidades como transferidas
              // Nota: Isso não gera venda financeira, apenas reduz disponibilidade no estoque geral
              quantitySold: { increment: amountFromThisLot } 
            },
          });

          remainingToTransfer -= amountFromThisLot;
        }
      }

      // Criar o novo lote no PDV (ou no Geral se posId for null)
      const lot = await tx.consignmentLot.create({
        data: {
          ...rest,
          unitPrice: toPrismaDecimal(unitPrice),
          commissionPercent: toPrismaDecimal(commissionPercent),
          tenantId,
        },
        include: {
          product: true,
          pos: true,
        },
      });

      // Se for venda imediata e tiver PDV vinculado (lógica mantida)
      if (isImmediateSale && createConsignmentLotDto.posId) {
        await this.salesService.create(tenantId, 'SYSTEM', {
          posId: createConsignmentLotDto.posId,
          items: [
            {
              productId: createConsignmentLotDto.productId,
              quantity: createConsignmentLotDto.quantityReceived,
              unitPrice: unitPrice
            }
          ]
        });
      }

      return lot;
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.consignmentLot.findMany({
      where: { tenantId },
      include: {
        product: true,
        pos: true,
      },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const lot = await this.prisma.consignmentLot.findFirst({
      where: { id, tenantId },
      include: {
        product: true,
        pos: true,
      },
    });

    if (!lot) {
      throw new NotFoundException('Lote de consignação não encontrado');
    }

    return lot;
  }

  async update(tenantId: string, id: string, updateConsignmentLotDto: UpdateConsignmentLotDto) {
    await this.findOne(tenantId, id);

    if (updateConsignmentLotDto.productId) {
      const product = await this.prisma.product.findFirst({
        where: { id: updateConsignmentLotDto.productId, tenantId },
      });
      if (!product) {
        throw new BadRequestException('Produto inválido');
      }
    }

    if (updateConsignmentLotDto.posId) {
      const pos = await this.prisma.pOS.findFirst({
        where: { id: updateConsignmentLotDto.posId, tenantId },
      });
      if (!pos) {
        throw new BadRequestException('Ponto de Venda inválido');
      }
    }

    const { unitPrice, commissionPercent, isImmediateSale, productId, posId, ...rest } = updateConsignmentLotDto;

    return this.prisma.consignmentLot.update({
      where: { id },
      data: {
        ...rest,
        unitPrice: unitPrice !== undefined ? toPrismaDecimal(unitPrice) : undefined,
        commissionPercent: commissionPercent !== undefined ? toPrismaDecimal(commissionPercent) : undefined,
        product: productId ? { connect: { id: productId } } : undefined,
        pos: posId ? { connect: { id: posId } } : undefined,
      },
      include: {
        product: true,
        pos: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.consignmentLot.delete({
      where: { id },
    });
  }

  async registerReturn(tenantId: string, id: string, quantity: number) {
    const lot = await this.findOne(tenantId, id);

    const available = lot.quantityReceived - lot.quantitySold - lot.quantityReturned - lot.quantityLost;
    if (available < quantity) {
      throw new BadRequestException(`Quantidade insuficiente no lote. Disponível: ${available}`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Atualizar o lote de origem (PDV)
      await tx.consignmentLot.update({
        where: { id },
        data: { quantityReturned: { increment: quantity } },
      });

      // 2. Criar um novo lote no "Estoque Geral" (posId: null)
      // Isso alimenta o estoque central automaticamente conforme a lógica do sistema
      return await tx.consignmentLot.create({
        data: {
          tenantId,
          productId: lot.productId,
          quantityReceived: quantity,
          unitPrice: lot.unitPrice,
          commissionPercent: lot.commissionPercent,
          reference: `RETORNO - ${lot.reference || 'S/Ref'}`,
          notes: `Devolução originada do lote ${lot.id} (PDV: ${lot.pos?.name || 'N/A'})`,
          posId: null, // Volta para o estoque central
        },
      });
    });
  }

  async registerLoss(tenantId: string, id: string, quantity: number, reason: string) {
    const lot = await this.findOne(tenantId, id);

    const available = lot.quantityReceived - lot.quantitySold - lot.quantityReturned - lot.quantityLost;
    if (available < quantity) {
      throw new BadRequestException(`Quantidade insuficiente no lote. Disponível: ${available}`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Atualizar o lote de origem (PDV)
      const updatedLot = await tx.consignmentLot.update({
        where: { id },
        data: { quantityLost: { increment: quantity } },
      });

      // 2. Refletir no Estoque Central para MENOS (Alimentação Negativa)
      // Criamos um lote com quantityReceived 0 e quantityLost positivo
      await tx.consignmentLot.create({
        data: {
          tenantId,
          productId: lot.productId,
          quantityReceived: 0,
          quantitySold: 0,
          quantityReturned: 0,
          quantityLost: quantity, // Isso gera saldo negativo no cálculo de estoque central
          unitPrice: lot.unitPrice,
          commissionPercent: lot.commissionPercent,
          reference: `PERDA NO PDV - ${lot.pos?.name || 'N/A'}`,
          notes: `Perda registrada no PDV. Motivo: ${reason}. ID Lote Origem: ${lot.id}`,
          posId: null, // Impacta o estoque central
        },
      });

      // 3. Lógica Financeira...
      const lossValue = Number(lot.unitPrice || 0) * quantity;
      
      if (lossValue > 0) {
        await tx.financialTransaction.create({
          data: {
            tenantId,
            type: 'ADJUSTMENT',
            amount: lossValue,
            referenceType: 'ADJUSTMENT',
            referenceId: lot.id,
            description: `PERDA: ${quantity} un de ${lot.product.name}. Motivo: ${reason}`,
          },
        });
      }

      // 3. Log de Operação
      await tx.operationLog.create({
        data: {
          tenantId,
          action: 'REGISTER_LOSS',
          entity: 'CONSIGNMENT_LOT',
          entityId: lot.id,
          metadata: { quantity, reason, lossValue },
        },
      });

      return updatedLot;
    });
  }
}
