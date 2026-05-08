import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConsignorAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByConsignor(tenantId: string, consignorId: string) {
    const account = await this.prisma.consignorAccount.findFirst({
      where: { consignorId, tenantId },
      include: {
        consignor: {
          select: { name: true, email: true }
        }
      }
    });

    if (!account) {
      throw new NotFoundException('Conta do consignador não encontrada');
    }

    return account;
  }
}
