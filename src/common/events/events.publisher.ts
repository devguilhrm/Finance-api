import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export interface AuthEvent {
  userId: string;
  email: string;
  role: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class EventsPublisher implements OnModuleInit {
  private readonly logger = new Logger(EventsPublisher.name);

  constructor(
    @Inject('AUTH_EVENTS_BROKER') private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('✅ Conectado ao Message Broker (Kafka/RabbitMQ)');
    } catch (error) {
      this.logger.error('❌ Falha ao conectar ao Message Broker', error);
    }
  }

  async publish(event: string, payload: AuthEvent) {
    try {
      await this.client.emit(event, { ...payload, timestamp: new Date() });
    } catch (error) {
      this.logger.error(`Falha ao publicar evento ${event}`, error);
    }
  }
}