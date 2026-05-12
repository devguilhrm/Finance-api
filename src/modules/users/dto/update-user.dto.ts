import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'New Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}