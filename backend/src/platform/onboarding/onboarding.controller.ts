import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from '../tenants/tenants.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('onboarding')
@Public()
@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo tenant e criar assinatura' })
  async register(@Body() data: any) {
    return this.tenantsService.register(data);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Listar planos disponíveis para assinatura' })
  async getPlans() {
    return this.prisma.subscriptionPlan.findMany();
  }

  @Get('seed-operational')
  @ApiOperation({ summary: 'Popular dados reais para teste (PDVs e Produtos)' })
  async seedOperational() {
    const tenant = await this.prisma.tenant.findFirst();
    if (!tenant) return { message: 'Nenhum tenant encontrado.' };

    // Criar Categorias
    const cat3d = await this.prisma.category.create({ data: { name: 'Colecionáveis 3D', tenantId: tenant.id } });
    const catPkg = await this.prisma.category.create({ data: { name: 'Produtos Embalados', tenantId: tenant.id } });

    // Criar PDVs
    const pdvs = [
      { name: 'Lab 3D Central', location: 'Sede' },
      { name: 'Quiosque Geek Plaza', location: 'Shopping' },
      { name: 'Empório Sul', location: 'Centro' }
    ];
    for (const p of pdvs) {
      await this.prisma.pOS.create({ data: { ...p, tenantId: tenant.id } });
    }

    return { message: 'Dados de teste carregados com sucesso!' };
  }
}
