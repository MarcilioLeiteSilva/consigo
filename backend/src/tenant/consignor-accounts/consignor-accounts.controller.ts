import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConsignorAccountsService } from './consignor-accounts.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('accounts')
export class ConsignorAccountsController {
  constructor(private readonly consignorAccountsService: ConsignorAccountsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter saldo e conta financeira do tenant' })
  findOne(@CurrentUser() user: any) {
    return this.consignorAccountsService.findByTenant(user.tenantId);
  }
}
