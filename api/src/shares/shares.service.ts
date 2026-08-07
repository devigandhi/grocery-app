import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShareDto } from './dto/create-share.dto';
import { formatItemsSummary } from './share-summary.util';

@Injectable()
export class SharesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateShareDto) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id: dto.shoppingListId },
      include: { items: { include: { grocery: true, shop: true } } },
    });
    if (!list || list.ownerId !== userId) {
      throw new NotFoundException('Shopping list not found');
    }

    const recipient = await this.prisma.user.findUnique({
      where: { id: dto.sharedWithUserId },
      select: { id: true, name: true, phoneNumber: true },
    });
    if (!recipient) {
      throw new NotFoundException('Recipient user not found');
    }

    // Freeze a snapshot of the list's current items onto the share — see
    // CLAUDE.md's "share snapshotting" note. Later edits to the live list or
    // to the underlying Grocery/Shop rows must never change this record.
    const share = await this.prisma.shoppingListShare.create({
      data: {
        shoppingListId: list.id,
        sharedByUserId: userId,
        sharedWithUserId: recipient.id,
        channel: dto.channel,
        items: {
          create: list.items.map((item) => ({
            groceryName: item.grocery.item,
            category: item.grocery.category,
            quantity: item.quantity,
            unit: item.unit,
            shopName: item.shop?.name ?? null,
          })),
        },
      },
      include: { items: true },
    });

    const summary = formatItemsSummary(share.items);
    const whatsappUrl = `https://wa.me/${recipient.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(summary)}`;
    const emailPayload = {
      subject: 'A shopping list was shared with you',
      body: summary,
    };

    return { share, whatsappUrl, emailPayload };
  }

  findSent(userId: string) {
    return this.prisma.shoppingListShare.findMany({
      where: { sharedByUserId: userId },
      include: {
        items: true,
        sharedWith: { select: { id: true, name: true, phoneNumber: true } },
      },
      orderBy: { sharedAt: 'desc' },
    });
  }

  findReceived(userId: string) {
    return this.prisma.shoppingListShare.findMany({
      where: { sharedWithUserId: userId },
      include: {
        items: true,
        sharedBy: { select: { id: true, name: true, phoneNumber: true } },
      },
      orderBy: { sharedAt: 'desc' },
    });
  }
}
