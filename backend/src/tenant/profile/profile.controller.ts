import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tenant/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Request() req) {
    return this.profileService.getProfile(req.user.tenantId);
  }

  @Patch()
  async updateProfile(@Request() req, @Body() data: { companyName?: string, document?: string, phone?: string, email?: string }) {
    return this.profileService.updateProfile(req.user.tenantId, data);
  }
}
