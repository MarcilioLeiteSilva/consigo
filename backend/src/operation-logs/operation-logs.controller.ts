import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OperationLogsService } from './operation-logs.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('logs')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('operation-logs')
export class OperationLogsController {
  constructor(private readonly operationLogsService: OperationLogsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE)
  @ApiOperation({ summary: 'Listar logs de operação (ADMIN/GERENTE)' })
  findAll(@CurrentUser() user: any) {
    return this.operationLogsService.findAll(user.tenantId);
  }
}
