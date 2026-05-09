import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsignmentLotDto } from './dto/create-consignment-lot.dto';
import { UpdateConsignmentLotDto } from './dto/update-consignment-lot.dto';
import { toDecimal } from '../../common/utils/money';

@Injectable()
export class ConsignmentLotsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createConsignmentLotDto: CreateConsignmentLotDto) {
    const { unitPrice, commissionPercent, ...rest } = createConsignmentLotDto;
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

    return this.prisma.consignmentLot.create({
      data: {
        ...rest,
        unitPrice: toDecimal(unitPrice),
        commissionPercent: toDecimal(commissionPercent),
        tenantId,
      },
      include: {
        product: true,
        pos: true,
      },
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

    const { unitPrice, commissionPercent, ...rest } = updateConsignmentLotDto;

    return this.prisma.consignmentLot.update({
      where: { id },
      data: {
        ...rest,
        unitPrice: unitPrice !== undefined ? toDecimal(unitPrice) : undefined,
        commissionPercent: commissionPercent !== undefined ? toDecimal(commissionPercent) : undefined,
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
}
