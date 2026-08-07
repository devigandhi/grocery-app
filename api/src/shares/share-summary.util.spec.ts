import { formatItemsSummary } from './share-summary.util';

describe('formatItemsSummary', () => {
  it('formats an item with a shop name', () => {
    expect(
      formatItemsSummary([
        {
          groceryName: 'Milk',
          quantity: 2,
          unit: 'L',
          shopName: 'Whole Foods',
        },
      ]),
    ).toBe('- Milk: 2 L (Whole Foods)');
  });

  it('formats an item without a shop name, omitting the parens', () => {
    expect(
      formatItemsSummary([
        { groceryName: 'Bread', quantity: 1, unit: 'PACK', shopName: null },
      ]),
    ).toBe('- Bread: 1 PACK');
  });

  it('joins multiple items with newlines', () => {
    expect(
      formatItemsSummary([
        { groceryName: 'Milk', quantity: 2, unit: 'L', shopName: null },
        {
          groceryName: 'Eggs',
          quantity: 12,
          unit: 'PCS',
          shopName: "Trader Joe's",
        },
      ]),
    ).toBe("- Milk: 2 L\n- Eggs: 12 PCS (Trader Joe's)");
  });

  it('returns an empty string for an empty list', () => {
    expect(formatItemsSummary([])).toBe('');
  });
});
