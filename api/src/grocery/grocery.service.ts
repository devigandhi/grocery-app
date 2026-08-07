import { Injectable } from '@nestjs/common';
import { Paginated } from '../common/paginated.interface';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { GroceryModel as Grocery } from '../../generated/prisma/models';
import { CreateGroceryDto } from './dto/create-grocery.dto';
import { GroceryQueryDto } from './dto/grocery-query.dto';
import { UpdateGroceryDto } from './dto/update-grocery.dto';

export interface GroceryCategoryGroup {
  category: string;
  items: Grocery[];
}

@Injectable()
export class GroceryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: GroceryQueryDto,
  ): Promise<Paginated<Grocery> | GroceryCategoryGroup[]> {
    if (query.groupBy === 'category') {
      const items = await this.prisma.grocery.findMany({
        orderBy: [{ category: 'asc' }, { item: 'asc' }],
      });
      const groups = new Map<string, Grocery[]>();
      for (const grocery of items) {
        const group = groups.get(grocery.category);
        if (group) {
          group.push(grocery);
        } else {
          groups.set(grocery.category, [grocery]);
        }
      }
      return Array.from(groups, ([category, groupItems]) => ({
        category,
        items: groupItems,
      }));
    }

    const { page, pageSize, category, search } = query;
    const where: Prisma.GroceryWhereInput = {
      ...(category && { category }),
      ...(search && { item: { contains: search, mode: 'insensitive' } }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.grocery.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ category: 'asc' }, { item: 'asc' }],
      }),
      this.prisma.grocery.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }

  create(dto: CreateGroceryDto): Promise<Grocery> {
    return this.prisma.grocery.create({ data: dto });
  }

  update(id: string, dto: UpdateGroceryDto): Promise<Grocery> {
    return this.prisma.grocery.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.grocery.delete({ where: { id } });
  }
}
