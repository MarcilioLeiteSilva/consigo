import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlatformAdminsService } from '../admins/platform-admins.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlatformAuthService {
  constructor(
    private readonly adminsService: PlatformAdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: any) {
    const admin = await this.adminsService.findByEmail(dto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'PLATFORM_ADMIN',
    };

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
