import {
  IsEnum,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({
    example: 'Salário',
    description: 'Transaction title',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @ApiProperty({
    example: 3500,
    description: 'Transaction amount',
  })
  @Type(() => Number) 
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a valid number with max 2 decimal places' },
  )
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.INCOME,
    description: 'Transaction type',
  })
  @IsEnum(TransactionType)
  type!: TransactionType; 

  @ApiProperty({
    example: 'Trabalho',
    description: 'Transaction category',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category!: string;
}