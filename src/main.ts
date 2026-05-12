import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true, logger: ['error', 'warn', 'log'] });

  // 🛡️ Segurança & Validação (Fase 2 & 7)
  app.use(helmet());
  app.enableCors({ origin: process.env.FRONTEND_URL || '*', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 📖 Swagger (Fase 10)
  const config = new DocumentBuilder()
    .setTitle('Finance API')
    .setDescription('API financeira segura e escalável')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
  Logger.log(`🚀 API running on http://localhost:${process.env.PORT || 3000}`);
  Logger.log(`📖 Docs: http://localhost:${process.env.PORT || 3000}/api`);
}
bootstrap();