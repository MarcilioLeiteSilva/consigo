import { Module } from '@nestjs/common';
import { PlatformAdminsService } from './platform-admins.service';
import { PlatformAdminsController } from './platform-admins.controller';

@Module({
  controllers: [PlatformAdminsController],
  providers: [PlatformAdminsService],
  exports: [PlatformAdminsService],
})
export class PlatformAdminsModule {}
