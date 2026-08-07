import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { createMockPrisma, type MockPrisma } from '../test/prisma-mock';
import { ShoppingListsService } from './shopping-lists.service';

describe('ShoppingListsService', () => {
  let prisma: MockPrisma;
  let service: ShoppingListsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new ShoppingListsService(prisma as unknown as PrismaService);
  });

  describe('addItem', () => {
    const dto = { groceryId: 'grocery-1', quantity: 2, unit: 'L' as const };

    it('creates a default list when the user has none yet', async () => {
      prisma.shoppingList.findFirst.mockResolvedValue(null);
      prisma.shoppingList.create.mockResolvedValue({
        id: 'list-new',
        ownerId: 'user-1',
      });
      prisma.shoppingListItem.create.mockResolvedValue({ id: 'item-1' });

      await service.addItem('user-1', dto);

      expect(prisma.shoppingList.create).toHaveBeenCalledWith({
        data: { ownerId: 'user-1' },
      });
      expect(prisma.shoppingListItem.create).toHaveBeenCalledWith({
        data: {
          shoppingListId: 'list-new',
          groceryId: 'grocery-1',
          quantity: 2,
          unit: 'L',
          shopId: undefined,
        },
        include: { grocery: true, shop: true },
      });
    });

    it('reuses the existing default list without creating a new one', async () => {
      prisma.shoppingList.findFirst.mockResolvedValue({
        id: 'list-existing',
        ownerId: 'user-1',
      });
      prisma.shoppingListItem.create.mockResolvedValue({ id: 'item-1' });

      await service.addItem('user-1', dto);

      expect(prisma.shoppingList.create).not.toHaveBeenCalled();
      expect(prisma.shoppingListItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ shoppingListId: 'list-existing' }),
        }),
      );
    });
  });

  describe('updateItem', () => {
    it('throws NotFoundException when the item does not exist', async () => {
      prisma.shoppingListItem.findUnique.mockResolvedValue(null);

      await expect(
        service.updateItem('user-1', 'item-1', { quantity: 3 }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.shoppingListItem.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the item belongs to another user', async () => {
      prisma.shoppingListItem.findUnique.mockResolvedValue({
        shoppingList: { ownerId: 'someone-else' },
      });

      await expect(
        service.updateItem('user-1', 'item-1', { quantity: 3 }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.shoppingListItem.update).not.toHaveBeenCalled();
    });

    it('updates the item when owned by the requesting user', async () => {
      prisma.shoppingListItem.findUnique.mockResolvedValue({
        shoppingList: { ownerId: 'user-1' },
      });
      prisma.shoppingListItem.update.mockResolvedValue({
        id: 'item-1',
        quantity: 3,
      });

      await service.updateItem('user-1', 'item-1', { quantity: 3 });

      expect(prisma.shoppingListItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 3 },
        include: { grocery: true, shop: true },
      });
    });
  });

  describe('removeItem', () => {
    it('throws NotFoundException when the item belongs to another user', async () => {
      prisma.shoppingListItem.findUnique.mockResolvedValue({
        shoppingList: { ownerId: 'someone-else' },
      });

      await expect(service.removeItem('user-1', 'item-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.shoppingListItem.delete).not.toHaveBeenCalled();
    });

    it('deletes the item when owned by the requesting user', async () => {
      prisma.shoppingListItem.findUnique.mockResolvedValue({
        shoppingList: { ownerId: 'user-1' },
      });

      await service.removeItem('user-1', 'item-1');

      expect(prisma.shoppingListItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });
  });
});
