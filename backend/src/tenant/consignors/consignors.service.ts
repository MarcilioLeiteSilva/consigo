import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsignorDto } from './dto/create-consignor.dto';
import { UpdateConsignorDto } from './dto/update-consignor.dto';

@Injectable()
export class ConsignorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createConsignorDto: CreateConsignorDto) {
    return this.prisma.consignor.create({
      data: {
        ...createConsignorDto,
        tenantId,
        account: {
          create: {
            tenantId,
          },
        },
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.consignor.findMany({
      where: { tenantId },
      include: {
        account: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const consignor = await this.prisma.consignor.findFirst({
      where: { id, tenantId },
    });

    if (!consignor) {
      throw new NotFoundException('Consignador não encontrado');
    }

    return consignor;
  }

  async update(tenantId: string, id: string, updateConsignorDto: UpdateConsignorDto) {
    await this.findOne(tenantId, id);

    return this.prisma.consignor.update({
      where: { id },
      data: updateConsignorDto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.consignor.delete({
      where: { id },
    });
  }
}
