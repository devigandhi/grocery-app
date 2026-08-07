function mockModel() {
  return {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };
}

export function createMockPrisma() {
  return {
    user: mockModel(),
    shop: mockModel(),
    grocery: mockModel(),
    shoppingList: mockModel(),
    shoppingListItem: mockModel(),
    shoppingListShare: mockModel(),
    $transaction: jest.fn((ops: Promise<any>[]) => Promise.all(ops)),
  };
}

export type MockPrisma = ReturnType<typeof createMockPrisma>;
