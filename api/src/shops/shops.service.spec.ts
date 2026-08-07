import type { PrismaService } from '../prisma/prisma.service';
import { createMockPrisma, type MockPrisma } from '../test/prisma-mock';
import { ShopsService } from './shops.service';

describe('ShopsService', () => {
  let prisma: MockPrisma;
  let service: ShopsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new ShopsService(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('paginates with the correct skip/take math and returns the total', async () => {
      prisma.shop.findMany.mockResolvedValue([
        { id: '1', name: 'Whole Foods' },
      ]);
      prisma.shop.count.mockResolvedValue(21);

      const result = await service.findAll({ page: 3, pageSize: 10 });

      expect(prisma.shop.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual({
        data: [{ id: '1', name: 'Whole Foods' }],
        total: 21,
        page: 3,
        pageSize: 10,
      });
    });
  });

  describe('create', () => {
    it('delegates to prisma.shop.create with the dto as data', async () => {
      const dto = { name: "Trader Joe's", location: 'Main St' };
      prisma.shop.create.mockResolvedValue({ id: '1', ...dto });

      await service.create(dto);

      expect(prisma.shop.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('update', () => {
    it('delegates to prisma.shop.update by id', async () => {
      const dto = { name: 'New Name' };
      prisma.shop.update.mockResolvedValue({ id: '1', ...dto });

      await service.update('1', dto);

      expect(prisma.shop.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('delegates to prisma.shop.delete by id', async () => {
      prisma.shop.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');

      expect(prisma.shop.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
