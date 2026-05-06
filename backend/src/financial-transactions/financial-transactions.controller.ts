import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinancialTransactionsService } from './financial-transactions.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('financial-transactions')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('transactions')
export class FinancialTransactionsController {
  constructor(private readonly financialTransactionsService: FinancialTransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar histórico de transações financeiras' })
  @ApiQuery({ name: 'consignor_id', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('consignor_id') consignorId?: string,
  ) {
    return this.financialTransactionsService.findAll(user.tenantId, consignorId);
  }
}
