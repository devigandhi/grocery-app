import { Injectable } from '@nestjs/common';
import { Paginated } from '../common/paginated.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ShopModel as Shop } from '../../generated/prisma/models';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<Shop>> {
    const { page, pageSize } = query;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.shop.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.shop.count(),
    ]);
    return { data, total, page, pageSize };
  }

  create(dto: CreateShopDto): Promise<Shop> {
    return this.prisma.shop.create({ data: dto });
  }

  update(id: string, dto: UpdateShopDto): Promise<Shop> {
    return this.prisma.shop.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.shop.delete({ where: { id } });
  }
}
