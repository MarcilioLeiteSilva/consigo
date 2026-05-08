import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { AsaasService } from '../payments/asaas.service';
import * as bcrypt from 'bcrypt';
import { TenantStatus, TenantUserRole } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly asaasService: AsaasService,
  ) {}

  async register(data: any) {
    const { companyName, email, slug, planId, adminName, adminPassword, document } = data;

    // 1. Validar se o slug já existe
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Este endereço (slug) já está em uso.');

    // 2. Buscar o plano
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plano não encontrado.');

    return this.prisma.$transaction(async (tx) => {
      // 3. Criar o Tenant
      const tenant = await tx.tenant.create({
        data: {
          companyName,
          email,
          slug,
          status: TenantStatus.TRIAL,
          document,
        },
      });

      // 4. Criar o Usuário Administrador do Tenant
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: email, // Usando o mesmo email da empresa para o admin inicial
          passwordHash: hashedPassword,
          name: adminName,
          role: TenantUserRole.TENANT_ADMIN,
        },
      });

      // 5. Inicializar Conta Financeira
      await tx.consignorAccount.create({
        data: {
          tenantId: tenant.id,
          balance: 0,
        },
      });

      // 6. Criar Assinatura (Mock ou Asaas)
      const asaasCustomer = await this.asaasService.createCustomer({
        name: companyName,
        email: email,
        cpfCnpj: document || '',
      });

      const asaasSub = await this.asaasService.createSubscription(asaasCustomer.id, plan);

      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          status: 'PENDING',
          startDate: new Date(),
          asaasSubscriptionId: asaasSub.id,
        },
      });

      return {
        tenantId: tenant.id,
        subscriptionId: subscription.id,
        message: 'Conta criada com sucesso! Complete o pagamento para ativar.',
      };
    });
  }

  async create(createTenantDto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: createTenantDto.slug },
    });

    if (existing) {
      throw new ConflictException('Slug já em uso');
    }

    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findOne(id);

    if (updateTenantDto.slug) {
      const existing = await this.prisma.tenant.findFirst({
        where: { slug: updateTenantDto.slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Slug já em uso');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.delete({
      where: { id },
    });
  }
}
