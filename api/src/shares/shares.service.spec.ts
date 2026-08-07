import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { createMockPrisma, type MockPrisma } from '../test/prisma-mock';
import { SharesService } from './shares.service';

describe('SharesService', () => {
  let prisma: MockPrisma;
  let service: SharesService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new SharesService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    const dto = {
      shoppingListId: 'list-1',
      sharedWithUserId: 'user-2',
      channel: 'WHATSAPP' as const,
    };

    it('throws NotFoundException when the list does not exist', async () => {
      prisma.shoppingList.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the list is not owned by the requester', async () => {
      prisma.shoppingList.findUnique.mockResolvedValue({
        id: 'list-1',
        ownerId: 'someone-else',
        items: [],
      });

      await expect(service.create('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the recipient does not exist', async () => {
      prisma.shoppingList.findUnique.mockResolvedValue({
        id: 'list-1',
        ownerId: 'user-1',
        items: [],
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('snapshots items, builds the wa.me URL and email payload on success', async () => {
      prisma.shoppingList.findUnique.mockResolvedValue({
        id: 'list-1',
        ownerId: 'user-1',
        items: [
          {
            quantity: 2,
            unit: 'L',
            grocery: { item: 'Milk', category: 'Dairy' },
            shop: { name: 'Whole Foods' },
          },
          {
            quantity: 1,
            unit: 'PACK',
            grocery: { item: 'Bread', category: 'Bakery' },
            shop: null,
          },
        ],
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-2',
        name: 'Jane',
        phoneNumber: '+1 (555) 123-4567',
      });
      prisma.shoppingListShare.create.mockResolvedValue({
        id: 'share-1',
        items: [
          {
            groceryName: 'Milk',
            category: 'Dairy',
            quantity: 2,
            unit: 'L',
            shopName: 'Whole Foods',
          },
          {
            groceryName: 'Bread',
            category: 'Bakery',
            quantity: 1,
            unit: 'PACK',
            shopName: null,
          },
        ],
      });

      const result = await service.create('user-1', dto);

      expect(prisma.shoppingListShare.create).toHaveBeenCalledWith({
        data: {
          shoppingListId: 'list-1',
          sharedByUserId: 'user-1',
          sharedWithUserId: 'user-2',
          channel: 'WHATSAPP',
          items: {
            create: [
              {
                groceryName: 'Milk',
                category: 'Dairy',
                quantity: 2,
                unit: 'L',
                shopName: 'Whole Foods',
              },
              {
                groceryName: 'Bread',
                category: 'Bakery',
                quantity: 1,
                unit: 'PACK',
                shopName: null,
              },
            ],
          },
        },
        include: { items: true },
      });

      expect(result.whatsappUrl).toBe(
        `https://wa.me/15551234567?text=${encodeURIComponent(
          '- Milk: 2 L (Whole Foods)\n- Bread: 1 PACK',
        )}`,
      );
      expect(result.emailPayload).toEqual({
        subject: 'A shopping list was shared with you',
        body: '- Milk: 2 L (Whole Foods)\n- Bread: 1 PACK',
      });
    });
  });

  describe('findSent', () => {
    it('queries shares sent by the user, newest first, with recipient info', async () => {
      await service.findSent('user-1');

      expect(prisma.shoppingListShare.findMany).toHaveBeenCalledWith({
        where: { sharedByUserId: 'user-1' },
        include: {
          items: true,
          sharedWith: { select: { id: true, name: true, phoneNumber: true } },
        },
        orderBy: { sharedAt: 'desc' },
      });
    });
  });

  describe('findReceived', () => {
    it('queries shares received by the user, newest first, with sender info', async () => {
      await service.findReceived('user-1');

      expect(prisma.shoppingListShare.findMany).toHaveBeenCalledWith({
        where: { sharedWithUserId: 'user-1' },
        include: {
          items: true,
          sharedBy: { select: { id: true, name: true, phoneNumber: true } },
        },
        orderBy: { sharedAt: 'desc' },
      });
    });
  });
});
