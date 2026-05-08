import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsignmentLotDto } from './dto/create-consignment-lot.dto';
import { UpdateConsignmentLotDto } from './dto/update-consignment-lot.dto';

@Injectable()
export class ConsignmentLotsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createConsignmentLotDto: CreateConsignmentLotDto) {
    // Validar Produto
    const product = await this.prisma.product.findFirst({
      where: { id: createConsignmentLotDto.productId, tenantId },
    });
    if (!product) {
      throw new BadRequestException('Produto inválido ou não pertence ao tenant');
    }

    // Validar Consignador
    const consignor = await this.prisma.consignor.findFirst({
      where: { id: createConsignmentLotDto.consignorId, tenantId },
    });
    if (!consignor) {
      throw new BadRequestException('Consignador inválido ou não pertence ao tenant');
    }

    return this.prisma.consignmentLot.create({
      data: {
        ...createConsignmentLotDto,
        tenantId,
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.consignmentLot.findMany({
      where: { tenantId },
      include: {
        product: true,
        consignor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const lot = await this.prisma.consignmentLot.findFirst({
      where: { id, tenantId },
      include: {
        product: true,
        consignor: true,
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

    if (updateConsignmentLotDto.consignorId) {
      const consignor = await this.prisma.consignor.findFirst({
        where: { id: updateConsignmentLotDto.consignorId, tenantId },
      });
      if (!consignor) {
        throw new BadRequestException('Consignador inválido');
      }
    }

    return this.prisma.consignmentLot.update({
      where: { id },
      data: updateConsignmentLotDto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.consignmentLot.delete({
      where: { id },
    });
  }
}
