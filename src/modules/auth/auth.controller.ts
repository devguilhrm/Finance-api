import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Request } from 'express';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async register(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  async login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
  })
  async refresh(
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async logout(
    @Req() req: RequestWithUser,
  ) {
    return this.authService.logout(
      req.user.id,
    );
  }
}

