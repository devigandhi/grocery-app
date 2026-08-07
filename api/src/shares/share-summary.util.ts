interface SummaryItem {
  groceryName: string;
  quantity: unknown;
  unit: string;
  shopName: string | null;
}

export function formatItemsSummary(items: SummaryItem[]): string {
  return items
    .map(
      (i) =>
        `- ${i.groceryName}: ${i.quantity} ${i.unit}${i.shopName ? ` (${i.shopName})` : ''}`,
    )
    .join('\n');
}
