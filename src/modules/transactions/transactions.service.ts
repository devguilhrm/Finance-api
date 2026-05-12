import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        ...dto,
        userId, // Garante que a transação seja vinculada ao usuário logado
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    try {
      // Tenta atualizar APENAS se o ID pertencer ao userId informado
      // Isso é atômico e mais seguro que fazer find primeiro
      return await this.prisma.transaction.update({
        where: {
          id,
          userId, // Cláusula de segurança: só atualiza se o dono for este usuário
        },
        data: dto,
      });
    } catch (error) {
      // Se cair aqui, é porque o registro não existe OU não pertence ao usuário
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Transaction not found or access denied');
      }
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    try {
  
      await this.prisma.transaction.delete({
        where: {
          id,
          userId, // Cláusula de segurança
        },
      });
      return { message: 'Deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Transaction not found or access denied');
      }
      throw error;
    }
  }

  async getSummary(userId: string) {

    const result = await this.prisma.transaction.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    const totalBalance = Number(result._sum.amount || 0);


    
    const incomeData = await this.prisma.transaction.aggregate({
      where: { userId, type: 'INCOME' },
      _sum: { amount: true },
    });

    const expenseData = await this.prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE' },
      _sum: { amount: true },
    });

    const income = Number(incomeData._sum.amount || 0);
    const expense = Number(expenseData._sum.amount || 0);

    return {
      income,
      expense,
      balance: income - expense,
      totalTransactions: result._count._all,
    };
  }
}