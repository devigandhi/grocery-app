---
name: shadcn-user-page
description: Use this skill when building or editing any page under web/src/app/** or any route under /app/* (grocery catalog, shopping list, share dialog, share history, shared-with-me). Covers Tailwind + shadcn/ui patterns for category accordions, add-to-list dialogs, editable list rows, and the share flow. Never import Ant Design here.
---

# Tailwind + shadcn/ui User Page Pattern

Reference: SPEC.md sections 3.3, 7.1, 7.3. CLAUDE.md "Strict UI separation" rule.

## Hard rule

Everything under `/app/*` (and the public routes) uses **Tailwind + shadcn/ui
only**. Never import an Ant Design component inside `web/src/app/**`.

## Grocery catalog page — grouped by category

Use an `Accordion` (shadcn) per category, each item opens an `AddToListDialog`.

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useGroceryQuery } from '@/features/grocery/useGroceryQuery';
import { AddToListDialog } from './AddToListDialog';

export function GroceryPage() {
  const { data, isLoading } = useGroceryQuery();
  const byCategory = groupBy(data ?? [], (item) => item.category);

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <Accordion type="multiple" className="w-full">
      {Object.entries(byCategory).map(([category, items]) => (
        <AccordionItem key={category} value={category}>
          <AccordionTrigger>{category}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2">
            {items.map((item) => (
              <AddToListDialog key={item.id} grocery={item} />
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

## Add-to-list dialog (qty + unit + shop)

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAddShoppingListItem } from '@/features/shopping-list/useShoppingListMutations';

export function AddToListDialog({ grocery }: { grocery: { id: string; item: string } }) {
  const addItem = useAddShoppingListItem();
  // local form state for quantity/unit/shopId omitted for brevity

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start">{grocery.item}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add {grocery.item}</DialogTitle></DialogHeader>
        {/* quantity Input, unit Select, shop Select */}
        <Button onClick={() => addItem.mutate({ groceryId: grocery.id, quantity: 1, unit: 'PCS' })}>
          Add to list
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

## Shopping list page — editable rows with delete confirm

Use `AlertDialog` for delete confirmation (never a bare click-to-delete, same
rule as the admin side just with shadcn's component instead of Ant's).

```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useDeleteShoppingListItem } from '@/features/shopping-list/useShoppingListMutations';

export function ShoppingListRow({ item }: { item: ShoppingListItem }) {
  const deleteItem = useDeleteShoppingListItem();

  return (
    <div className="flex items-center justify-between border-b py-2">
      <span>{item.grocery.item} — {item.quantity} {item.unit}</span>
      <div className="flex gap-2">
        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <p>Remove this item from your list?</p>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteItem.mutate(item.id)}>Remove</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
```

## Share dialog — recipient search + channel toggle

Use a `Combobox` (shadcn `Command` + `Popover`) for recipient search, and a
simple two-button toggle for channel (WhatsApp/Email). On submit, call
`POST /api/v1/shares` and open the returned `whatsappUrl` in a new tab, or
build a `mailto:` link from `emailPayload`.

## Notifications

Use `sonner` (or shadcn `toast`) for success/error feedback on this side —
never Ant's `message`/`notification` inside `/app/*`.

## Checklist

- [ ] No Ant Design imports anywhere in `web/src/app/**`
- [ ] Destructive actions (delete, remove) go through `AlertDialog`, never a bare button
- [ ] Data comes from a `useXQuery`/`useXMutation` hook (see `tanstack-query-hooks` skill)
- [ ] Grocery catalog stays grouped by category, not a flat list
- [ ] Share flow returns and actually uses `whatsappUrl` / `emailPayload` from the API — don't hardcode the message format client-side
