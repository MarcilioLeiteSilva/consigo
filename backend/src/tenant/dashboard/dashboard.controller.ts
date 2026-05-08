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

  @Get('sales-summary')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Resumo de vendas (Admin/Gerente)' })
  getSalesSummary(@CurrentUser() user: any) {
    return this.dashboardService.getSalesSummary(user.tenantId);
  }

  @Get('top-consignors')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Ranking de produtos (antigo top-consignors)' })
  getTopConsignors(@CurrentUser() user: any) {
    return this.dashboardService.getTopConsignors(user.tenantId);
  }

  @Get('financial-summary')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Resumo financeiro: saldos e pagamentos' })
  getFinancialSummary(@CurrentUser() user: any) {
    return this.dashboardService.getFinancialSummary(user.tenantId);
  }

  @Get('slow-products')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Produtos com baixo giro e tempo em estoque' })
  getSlowProducts(@CurrentUser() user: any) {
    return this.dashboardService.getSlowProducts(user.tenantId);
  }
}
