import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PlatformAuthService } from './platform-auth.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('platform/auth')
export class PlatformAuthController {
  constructor(private readonly authService: PlatformAuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    return this.authService.login(body);
  }
}
