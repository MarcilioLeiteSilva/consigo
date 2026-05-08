import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialTransactionsService } from './financial-transactions.service';
import { RolesGuard } from '../../common/guards/roles.guard';
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
}
