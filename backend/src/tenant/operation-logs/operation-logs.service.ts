import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OperationLogsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.operationLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Últimos 100 logs
    });
  }
}
