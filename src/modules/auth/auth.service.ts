import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../prisma/prisma.service';

import { EventsPublisher } from '../../common/events/events.publisher';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { Role } from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly jwt: JwtService,

    private readonly config: ConfigService,

    private readonly events: EventsPublisher,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email
      .toLowerCase()
      .trim();

    const exists =
      await this.prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (exists) {
      throw new ConflictException(
        'Email already registered',
      );
    }

    const passwordHash =
      await bcrypt.hash(dto.password, 12);

    const refreshToken =
      this.generateRefreshToken();

    const hashedRefreshToken =
      await bcrypt.hash(refreshToken, 10);

    const user =
      await this.prisma.user.create({
        data: {
          email: normalizedEmail,

          name: dto.name.trim(),

          passwordHash,

          role: Role.USER,

          refreshToken:
            hashedRefreshToken,
        },

        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

    const accessToken =
      this.generateAccessToken(
        user.id,
        user.email,
        user.role,
      );

    await this.events.publish(
      'auth.register',
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        timestamp: new Date(),
      },
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email
      .toLowerCase()
      .trim();

    const user =
      await this.prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const validPassword =
      await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );

    if (!validPassword) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const refreshToken =
      this.generateRefreshToken();

    const hashedRefreshToken =
      await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        refreshToken:
          hashedRefreshToken,

        lastLogin: new Date(),
      },
    });

    const accessToken =
      this.generateAccessToken(
        user.id,
        user.email,
        user.role,
      );

    await this.events.publish(
      'auth.login',
      {
        userId: user.id,
        email: user.email,
        role: user.role,

        timestamp: new Date(),

        metadata: {
          ip: 'N/A',
          userAgent: 'N/A',
        },
      },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },

      accessToken,

      refreshToken,
    };
  }

  async refresh(dto: {
    refreshToken: string;
  }) {
    const users =
      await this.prisma.user.findMany({
        where: {
          refreshToken: {
            not: null,
          },
        },
      });

    let validUser = null;

    for (const user of users) {
      const valid =
        await bcrypt.compare(
          dto.refreshToken,
          user.refreshToken!,
        );

      if (valid) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const newRefreshToken =
      this.generateRefreshToken();

    const hashedRefreshToken =
      await bcrypt.hash(
        newRefreshToken,
        10,
      );

    await this.prisma.user.update({
      where: {
        id: validUser.id,
      },

      data: {
        refreshToken:
          hashedRefreshToken,
      },
    });

    const accessToken =
      this.generateAccessToken(
        validUser.id,
        validUser.email,
        validUser.role,
      );

    await this.events.publish(
      'auth.token.refresh',
      {
        userId: validUser.id,
        email: validUser.email,
        role: validUser.role,
        timestamp: new Date(),
      },
    );

    return {
      accessToken,

      refreshToken:
        newRefreshToken,
    };
  }

  async logout(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        refreshToken: null,
      },
    });

    await this.events.publish(
      'auth.logout',
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        timestamp: new Date(),
      },
    );

    return {
      message:
        'Logged out successfully',
    };
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: Role,
  ) {
    return this.jwt.sign(
      {
        sub: userId,
        email,
        role,
      },

      {
        secret:
          this.config.get<string>(
            'JWT_SECRET',
          ),

        expiresIn:
          this.config.get<string>(
            'JWT_EXPIRES_IN',
          ) || '15m',
      },
    );
  }

  private generateRefreshToken() {
    return randomBytes(40).toString(
      'hex',
    );
  }
}
