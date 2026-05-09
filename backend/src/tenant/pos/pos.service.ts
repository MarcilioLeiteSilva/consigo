import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePosDto } from './dto/create-pos.dto';
import { UpdatePosDto } from './dto/update-pos.dto';
import { toPrismaDecimal } from '../../common/utils/prisma-decimal';

@Injectable()
export class PosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createPosDto: CreatePosDto) {
    const { defaultCommission, ...data } = createPosDto;
    
    return this.prisma.pOS.create({
      data: {
        ...data,
        tenantId,
        defaultCommission: defaultCommission ? toPrismaDecimal(defaultCommission) : null,
      },
    });
  }

  async findAll(tenantId: string) {
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
      throw new NotFoundException('Ponto de Venda não encontrado');
    }

    return pos;
  }

  async update(tenantId: string, id: string, updatePosDto: UpdatePosDto) {
    await this.findOne(tenantId, id);
    const { defaultCommission, ...data } = updatePosDto;

    return this.prisma.pOS.update({
      where: { id },
      data: {
        ...data,
        defaultCommission: defaultCommission !== undefined ? (defaultCommission ? toPrismaDecimal(defaultCommission) : null) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.pOS.delete({
      where: { id },
    });
  }
}
