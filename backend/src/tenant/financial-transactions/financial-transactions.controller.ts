import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialTransactionsService } from './financial-transactions.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantUserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('financial-transactions')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('transactions')
export class FinancialTransactionsController {
  constructor(private readonly financialTransactionsService: FinancialTransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar histórico de transações financeiras do tenant' })
  findAll(
    @CurrentUser() user: any,
  ) {
    return this.financialTransactionsService.findAll(user.tenantId);
  }

  @Post('expense')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Registrar despesa manual com categoria' })
  createExpense(
    @CurrentUser() user: any,
    @Body() body: { amount: number; description: string; category: string },
  ) {
    return this.financialTransactionsService.createExpense(user.tenantId, body);
  }

  @Get('cash-flow')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Fluxo de caixa mensal com categorias' })
  getCashFlow(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const now = new Date();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    const y = year ? parseInt(year) : now.getFullYear();
    return this.financialTransactionsService.getCashFlow(user.tenantId, m, y);
  }
}
