import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConsignorAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    const account = await this.prisma.consignorAccount.findUnique({
      where: { tenantId },
      include: {
        tenant: {
          select: { companyName: true, email: true }
        }
      }
    });

    if (!account) {
      throw new NotFoundException('Conta financeira do tenant não encontrada');
    }

    return account;
  }
}
