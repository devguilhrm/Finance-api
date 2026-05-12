import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Current refresh token',
    example:
      '2f1c4c2b3d8e6a7f9b1e4d5c6a7b8c9d',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

