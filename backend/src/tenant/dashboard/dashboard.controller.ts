import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantUserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Métricas gerais (KPIs) do Tenant' })
  getMetrics(@CurrentUser() user: any) {
    return this.dashboardService.getMetrics(user.tenantId);
  }

  @Get('sales-chart')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Dados de vendas para gráfico por período' })
  getSalesChart(@CurrentUser() user: any) {
    return this.dashboardService.getSalesByPeriod(user.tenantId);
  }

  @Get('top-products')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Ranking dos produtos mais vendidos' })
  getTopProducts(@CurrentUser() user: any) {
    return this.dashboardService.getTopProducts(user.tenantId);
  }
}
