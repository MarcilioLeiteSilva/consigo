import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  controllers: [OnboardingController],
})
export class OnboardingModule {}
