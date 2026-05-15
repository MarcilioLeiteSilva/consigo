import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        companyName: true,
        document: true,
        email: true,
        phone: true,
        slug: true,
        status: true,
      },
    });
  }

  async updateProfile(tenantId: string, data: { companyName?: string, document?: string, phone?: string, email?: string }) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        companyName: data.companyName,
        document: data.document,
        phone: data.phone,
        email: data.email,
      },
    });
  }
}
