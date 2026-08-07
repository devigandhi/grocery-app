import type { PrismaService } from '../prisma/prisma.service';
import { createMockPrisma, type MockPrisma } from '../test/prisma-mock';
import { GroceryService } from './grocery.service';

describe('GroceryService', () => {
  let prisma: MockPrisma;
  let service: GroceryService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new GroceryService(prisma as unknown as PrismaService);
  });

  describe('findAll with groupBy=category', () => {
    it('groups items by category, preserving item order within each group', async () => {
      prisma.grocery.findMany.mockResolvedValue([
        { id: '1', item: 'Apple', category: 'Produce' },
        { id: '2', item: 'Banana', category: 'Produce' },
        { id: '3', item: 'Milk', category: 'Dairy' },
      ]);

      const result = await service.findAll({ groupBy: 'category' } as never);

      expect(result).toEqual([
        {
          category: 'Produce',
          items: [
            { id: '1', item: 'Apple', category: 'Produce' },
            { id: '2', item: 'Banana', category: 'Produce' },
          ],
        },
        {
          category: 'Dairy',
          items: [{ id: '3', item: 'Milk', category: 'Dairy' }],
        },
      ]);
    });
  });

  describe('findAll without groupBy', () => {
    it('applies category and search filters and paginates', async () => {
      prisma.grocery.findMany.mockResolvedValue([{ id: '1', item: 'Apple' }]);
      prisma.grocery.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 2,
        pageSize: 10,
        category: 'Produce',
        search: 'app',
      });

      expect(prisma.grocery.findMany).toHaveBeenCalledWith({
        where: {
          category: 'Produce',
          item: { contains: 'app', mode: 'insensitive' },
        },
        skip: 10,
        take: 10,
        orderBy: [{ category: 'asc' }, { item: 'asc' }],
      });
      expect(result).toEqual({
        data: [{ id: '1', item: 'Apple' }],
        total: 1,
        page: 2,
        pageSize: 10,
      });
    });

    it('builds an empty where clause when no filters are given', async () => {
      prisma.grocery.findMany.mockResolvedValue([]);
      prisma.grocery.count.mockResolvedValue(0);

      await service.findAll({ page: 1, pageSize: 20 });

      expect(prisma.grocery.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });
});
