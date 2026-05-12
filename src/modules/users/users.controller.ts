import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

// Interface para tipar o objeto user injetado pelo JWT Strategy
interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiResponse({ status: 200, description: 'Retorna o perfil do usuário logado.' })
  getProfile(@Request() req: RequestWithUser) {
    // req.user.id vem do payload do JWT validado pelo JwtStrategy
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  updateProfile(@Request() req: RequestWithUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }
}