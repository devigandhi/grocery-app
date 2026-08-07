import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

const itemInclude = {
  grocery: true,
  shop: true,
} satisfies Prisma.ShoppingListItemInclude;

@Injectable()
export class ShoppingListsService {
  constructor(private readonly prisma: PrismaService) {}

  findMyLists(userId: string) {
    return this.prisma.shoppingList.findMany({
      where: { ownerId: userId },
      include: {
        items: { include: itemInclude, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getOrCreateDefaultList(userId: string) {
    const existing = await this.prisma.shoppingList.findFirst({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
    });
    if (existing) return existing;
    return this.prisma.shoppingList.create({ data: { ownerId: userId } });
  }

  async addItem(userId: string, dto: AddItemDto) {
    const list = await this.getOrCreateDefaultList(userId);
    return this.prisma.shoppingListItem.create({
      data: {
        shoppingListId: list.id,
        groceryId: dto.groceryId,
        quantity: dto.quantity,
        unit: dto.unit,
        shopId: dto.shopId,
      },
      include: itemInclude,
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateItemDto) {
    await this.assertOwnsItem(userId, itemId);
    return this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: dto,
      include: itemInclude,
    });
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    await this.assertOwnsItem(userId, itemId);
    await this.prisma.shoppingListItem.delete({ where: { id: itemId } });
  }

  private async assertOwnsItem(userId: string, itemId: string): Promise<void> {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      select: { shoppingList: { select: { ownerId: true } } },
    });
    if (!item || item.shoppingList.ownerId !== userId) {
      throw new NotFoundException('Shopping list item not found');
    }
  }
}
