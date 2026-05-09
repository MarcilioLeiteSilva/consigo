import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePosDto } from './dto/create-pos.dto';
import { UpdatePosDto } from './dto/update-pos.dto';

@Injectable()
export class PosService {
  constructor(private readonly prisma: PrismaService) {}

  private mapPos(pos: any) {
    if (!pos) return null;
    return {
      ...pos,
      defaultCommission: pos.defaultCommission ? Number(pos.defaultCommission) : 0,
    };
  }

  async create(tenantId: string, createPosDto: CreatePosDto) {
    const { defaultCommission, ...data } = createPosDto;
    
    const pos = await this.prisma.pOS.create({
      data: {
        ...data,
        tenantId,
        defaultCommission: defaultCommission ? Number(defaultCommission) : null,
      },
    });

    return this.mapPos(pos);
  }

  async findAll(tenantId: string) {
    const posList = await this.prisma.pOS.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    return posList.map(p => this.mapPos(p));
  }

  async findOne(tenantId: string, id: string) {
    const pos = await this.prisma.pOS.findFirst({
      where: { id, tenantId },
    });

    if (!pos) {
      throw new NotFoundException('Ponto de Venda não encontrado');
    }

    return this.mapPos(pos);
  }

  async update(tenantId: string, id: string, updatePosDto: UpdatePosDto) {
    await this.findOne(tenantId, id);
    const { defaultCommission, ...data } = updatePosDto;

    const updated = await this.prisma.pOS.update({
      where: { id },
      data: {
        ...data,
        ...(defaultCommission !== undefined && { defaultCommission: defaultCommission !== null ? Number(defaultCommission) : null }),
      },
    });

    return this.mapPos(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.pOS.delete({
      where: { id },
    });
  }
}
