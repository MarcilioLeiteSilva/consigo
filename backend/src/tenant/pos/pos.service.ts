import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePoDto } from './dto/create-po.dto';
import { UpdatePoDto } from './dto/update-po.dto';

@Injectable()
export class PosService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, createPoDto: CreatePoDto) {
    return this.prisma.pOS.create({
      data: {
        ...createPoDto,
        tenantId,
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.pOS.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const pos = await this.prisma.pOS.findFirst({
      where: { id, tenantId },
    });

    if (!pos) {
      throw new NotFoundException('Ponto de venda não encontrado');
    }

    return pos;
  }

  async update(tenantId: string, id: string, updatePoDto: UpdatePoDto) {
    await this.findOne(tenantId, id);

    return this.prisma.pOS.update({
      where: { id },
      data: updatePoDto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.pOS.delete({
      where: { id },
    });
  }
}
