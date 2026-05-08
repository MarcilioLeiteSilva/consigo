import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        isActive: true,
      },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.tenant.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tenant inativo ou suspenso');
    }

    const tokens = await this.generateTokens(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: { id: user.tenant.id, name: user.tenant.companyName },
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken || !user.isActive) {
      throw new UnauthorizedException('Acesso negado');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatches) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokens = await this.generateTokens(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logout realizado com sucesso' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
        tenant: { select: { id: true, companyName: true, slug: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }

  private async generateTokens(user: { id: string; email: string; tenantId: string; role: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET') || 'default_secret_key_123',
        expiresIn: this.config.get('JWT_EXPIRES_IN') || '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET') || 'default_refresh_key_123',
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async decodeRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }
}
