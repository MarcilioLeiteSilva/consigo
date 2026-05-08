import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from '../tenants/tenants.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('onboarding')
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
}
