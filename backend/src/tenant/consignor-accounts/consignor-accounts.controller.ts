import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConsignorAccountsService } from './consignor-accounts.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('consignors')
export class ConsignorAccountsController {
  constructor(private readonly consignorAccountsService: ConsignorAccountsService) {}

  @Get(':id/account')
  @ApiOperation({ summary: 'Obter saldo e conta de um consignador' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.consignorAccountsService.findByConsignor(user.tenantId, id);
  }
}
