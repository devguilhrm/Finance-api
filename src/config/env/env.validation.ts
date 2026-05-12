import { plainToInstance } from 'class-transformer';

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum BrokerType {
  rabbitmq = 'rabbitmq',
  kafka = 'kafka',
}

class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  DATABASE_URL!: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET!: string;

  @IsNotEmpty()
  @IsString()
  JWT_EXPIRES_IN!: string;

  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsOptional()
  @IsEnum(BrokerType)
  BROKER_TYPE: BrokerType = BrokerType.rabbitmq;

  @IsOptional()
  @IsString()
  BROKER_URL: string =
    'amqp://guest:guest@localhost:5672';
}

export function validateEnv(
  config: Record<string, unknown>,
) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    {
      enableImplicitConversion: true,
    },
  );

  const errors = validateSync(
    validatedConfig,
    {
      skipMissingProperties: false,
    },
  );

  if (errors.length > 0) {
    throw new Error(
      errors.toString(),
    );
  }

  return validatedConfig;
}

