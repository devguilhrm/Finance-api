import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Request } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { TransactionsService } from './transactions.service';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly service: TransactionsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new transaction',
  })
  @ApiResponse({
    status: 201,
    description:
      'Transaction created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async create(
    @Req() req: RequestWithUser,

    @Body()
    dto: CreateTransactionDto,
  ) {
    return this.service.create(
      req.user.id,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List user transactions',
  })
  @ApiResponse({
    status: 200,
    description:
      'Transactions retrieved successfully',
  })
  async findAll(
    @Req() req: RequestWithUser,
  ) {
    return this.service.findAll(
      req.user.id,
    );
  }

  @Get('summary')
  @ApiOperation({
    summary:
      'Get financial summary',
  })
  @ApiResponse({
    status: 200,
    description:
      'Summary retrieved successfully',
  })
  async summary(
    @Req() req: RequestWithUser,
  ) {
    return this.service.getSummary(
      req.user.id,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update transaction',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description:
      'Transaction UUID',
  })
  @ApiResponse({
    status: 200,
    description:
      'Transaction updated successfully',
  })
  async update(
    @Req() req: RequestWithUser,

    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Body()
    dto: UpdateTransactionDto,
  ) {
    return this.service.update(
      req.user.id,
      id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete transaction',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description:
      'Transaction UUID',
  })
  @ApiResponse({
    status: 200,
    description:
      'Transaction deleted successfully',
  })
  async remove(
    @Req() req: RequestWithUser,

    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.service.remove(
      req.user.id,
      id,
    );
  }
}

