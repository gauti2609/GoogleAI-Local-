import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialEntityService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string, entityType: string) {
    return this.prisma.financialEntity.create({
      data: {
        name,
        entityType,
        userId,
        data: {},
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.financialEntity.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const entity = await this.prisma.financialEntity.findFirst({
      where: { id, userId },
    });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  async update(id: string, userId: string, data: any) {
    await this.findOne(id, userId); // Check ownership
    return this.prisma.financialEntity.update({
      where: { id },
      data: { data, updatedAt: new Date() },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check ownership
    await this.prisma.financialEntity.delete({ where: { id } });
  }
}
