import { Module } from '@nestjs/common';
import { TenantsModule } from './tenants/tenants.module';
import { PlatformAdminsModule } from './admins/platform-admins.module';
import { PlatformAuthModule } from './auth/platform-auth.module';
import { SubscriptionPlansModule } from './plans/subscription-plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [
    TenantsModule,
    PlatformAdminsModule,
    PlatformAuthModule,
    SubscriptionPlansModule,
    SubscriptionsModule,
    PaymentsModule,
    OnboardingModule,
  ],
})
export class PlatformModule {}
