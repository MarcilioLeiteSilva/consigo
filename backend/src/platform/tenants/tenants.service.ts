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
    const { companyName, email, slug, adminName, adminPassword, document } = data;
    const planId = data.planId || 'plano-bronze';

    console.log(`🚀 Iniciando registro para ${companyName} (${slug})...`);

    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Este endereço (slug) já está em uso.');

    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      console.error(`❌ Erro: Plano ${planId} não encontrado no banco.`);
      throw new NotFoundException('Plano não encontrado.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        console.log('📦 Criando Tenant...');
        const tenant = await tx.tenant.create({
          data: { companyName, email, slug, status: TenantStatus.TRIAL, document },
        });

        console.log('👤 Criando Usuário Admin...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await tx.user.create({
          data: {
            tenantId: tenant.id,
            email: email,
            passwordHash: hashedPassword,
            name: adminName,
            role: TenantUserRole.TENANT_ADMIN,
          },
        });

        console.log('💰 Inicializando Conta Financeira...');
        await tx.consignorAccount.create({
          data: { tenantId: tenant.id, balance: 0 },
        });

        console.log('💳 Integrando com Asaas...');
        const asaasCustomer = await this.asaasService.createCustomer({
          name: companyName,
          email: email,
          cpfCnpj: document || '',
        });

        const asaasSub = await this.asaasService.createSubscription(asaasCustomer.id, plan);

        console.log('📄 Criando Assinatura...');
        const subscription = await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan.id,
            status: 'PENDING',
            startDate: new Date(),
            asaasSubscriptionId: asaasSub.id,
          },
        });

        console.log('✅ Registro concluído com sucesso!');
        return {
          tenantId: tenant.id,
          subscriptionId: subscription.id,
          message: 'Conta criada com sucesso!',
        };
      });
    } catch (error: any) {
      console.error('🔥 Erro Crítico no Registro:', error.message);
      throw new InternalServerErrorException(`Erro ao processar registro: ${error.message}`);
    }
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
