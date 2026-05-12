import {
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'John Doe',
  })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    example: 'StrongPass123!',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}

