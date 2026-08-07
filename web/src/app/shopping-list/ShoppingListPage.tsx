import { Skeleton } from "@/components/ui/skeleton";
import { useShoppingListQuery } from "@/features/shopping-list/useShoppingListQuery";
import { ShareDialog } from "./ShareDialog";
import { ShoppingListRow } from "./ShoppingListRow";

export function ShoppingListPage() {
  const { data, isLoading, isError } = useShoppingListQuery();
  const list = data?.[0];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Couldn't load your shopping list. Please try again.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Shopping List</h1>
        {list && list.items.length > 0 && (
          <ShareDialog shoppingListId={list.id} />
        )}
      </div>
      {!list || list.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Your list is empty — add items from the grocery catalog.
        </p>
      ) : (
        <div>
          {list.items.map((item) => (
            <ShoppingListRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
