import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useDeleteShoppingListItem,
  useUpdateShoppingListItem,
} from "@/features/shopping-list/useShoppingListMutations";
import { useShopsQuery } from "@/features/shops/useShopsQuery";
import { UNIT_LABELS, UNITS, type Unit } from "@/lib/enums";
import type { ShoppingListItem } from "@/lib/types";

export function ShoppingListRow({ item }: { item: ShoppingListItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState<Unit>(item.unit);
  const [shopId, setShopId] = useState<string | undefined>(
    item.shopId ?? undefined,
  );
  const { data: shops } = useShopsQuery({ page: 1, pageSize: 100 });
  const updateItem = useUpdateShoppingListItem();
  const deleteItem = useDeleteShoppingListItem();

  const handleSave = () => {
    updateItem.mutate(
      { id: item.id, quantity: Number(quantity), unit, shopId },
      {
        onSuccess: () => {
          toast.success("Item updated");
          setEditOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleDelete = () => {
    deleteItem.mutate(item.id, {
      onSuccess: () => toast.success("Item removed"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex items-center justify-between border-b py-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.grocery.item}</span>
          <Badge variant="outline">{item.grocery.category}</Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {item.quantity} {UNIT_LABELS[item.unit]}
          {item.shop ? ` · ${item.shop.name}` : " · Any shop"}
        </span>
      </div>
      <div className="flex gap-1">
        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <SheetTrigger render={<Button size="icon" variant="ghost" />}>
            <Pencil className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit {item.grocery.item}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                <Input
                  id={`quantity-${item.id}`}
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Unit</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {UNIT_LABELS[u]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Preferred shop</Label>
                <Select
                  value={shopId}
                  onValueChange={(v) => setShopId(v ?? undefined)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops?.data.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleSave} disabled={updateItem.isPending}>
                {updateItem.isPending ? "Saving..." : "Save changes"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <AlertDialog>
          <AlertDialogTrigger render={<Button size="icon" variant="ghost" />}>
            <Trash2 className="h-4 w-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this item?</AlertDialogTitle>
              <AlertDialogDescription>
                {item.grocery.item} will be removed from your shopping list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
