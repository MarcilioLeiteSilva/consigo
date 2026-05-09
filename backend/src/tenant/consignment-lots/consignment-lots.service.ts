import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsignmentLotDto } from './dto/create-consignment-lot.dto';
import { UpdateConsignmentLotDto } from './dto/update-consignment-lot.dto';

@Injectable()
export class ConsignmentLotsService {
  constructor(private readonly prisma: PrismaService) {}
  
  private mapLot(lot: any) {
    if (!lot) return null;
    return {
      ...lot,
      unitPrice: lot.unitPrice ? Number(lot.unitPrice) : 0,
      commissionPercent: lot.commissionPercent ? Number(lot.commissionPercent) : 0,
      product: lot.product ? {
        ...lot.product,
        salePrice: lot.product.salePrice ? Number(lot.product.salePrice) : 0,
        commission: lot.product.commission ? Number(lot.product.commission) : 0,
      } : undefined,
    };
  }

  async create(tenantId: string, createConsignmentLotDto: CreateConsignmentLotDto) {
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

    const lot = await this.prisma.consignmentLot.create({
      data: {
        ...createConsignmentLotDto,
        tenantId,
      },
      include: {
        product: true,
        pos: true,
      },
    });

    return this.mapLot(lot);
  }

  async findAll(tenantId: string) {
    const lots = await this.prisma.consignmentLot.findMany({
      where: { tenantId },
      include: {
        product: true,
        pos: true,
      },
      orderBy: { receivedAt: 'desc' },
    });

    return lots.map(l => this.mapLot(l));
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

    return this.mapLot(lot);
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

    const updated = await this.prisma.consignmentLot.update({
      where: { id },
      data: updateConsignmentLotDto,
      include: {
        product: true,
        pos: true,
      },
    });

    return this.mapLot(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.consignmentLot.delete({
      where: { id },
    });
  }
}
