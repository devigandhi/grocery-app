import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroceryCatalogQuery } from "@/features/grocery/useGroceryQuery";
import { AddToListDialog } from "./AddToListDialog";

export function GroceryCatalogPage() {
  const { data, isLoading, isError } = useGroceryCatalogQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Couldn't load the grocery catalog. Please try again.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No grocery items yet — check back later.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Grocery Catalog</h1>
      <Accordion className="w-full">
        {data.map((group) => (
          <AccordionItem key={group.category} value={group.category}>
            <AccordionTrigger>
              {group.category}{" "}
              <span className="text-muted-foreground">
                ({group.items.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              {group.items.map((item) => (
                <AddToListDialog key={item.id} grocery={item} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
