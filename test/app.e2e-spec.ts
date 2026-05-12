import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API E2E (Auth + Transactions)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    await prisma.user.deleteMany();
    await prisma.transaction.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('1. POST /auth/register → cria usuário', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@e2e.com', name: 'E2E User', password: 'Test123456!' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
    userId = res.body.user.id;
  });

  it('2. POST /auth/login → retorna JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@e2e.com', password: 'Test123456!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('3. POST /transactions → cria transação', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Salário', amount: 5000, type: 'INCOME', category: 'Trabalho' });
    expect(res.status).toBe(201);
  });

  it('4. GET /transactions/summary → calcula saldo', async () => {
    const res = await request(app.getHttpServer())
      .get('/transactions/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('balance');
    expect(res.body.income).toBeGreaterThanOrEqual(5000);
  });
});