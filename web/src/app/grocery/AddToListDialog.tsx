import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddShoppingListItem } from "@/features/shopping-list/useShoppingListMutations";
import { useShopsQuery } from "@/features/shops/useShopsQuery";
import { UNIT_LABELS, UNITS, type Unit } from "@/lib/enums";
import type { Grocery } from "@/lib/types";

export function AddToListDialog({ grocery }: { grocery: Grocery }) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<Unit>("PCS");
  const [shopId, setShopId] = useState<string | undefined>(undefined);
  const { data: shops } = useShopsQuery({ page: 1, pageSize: 100 });
  const addItem = useAddShoppingListItem();

  const handleAdd = () => {
    addItem.mutate(
      {
        groceryId: grocery.id,
        quantity: Number(quantity),
        unit,
        shopId,
      },
      {
        onSuccess: () => {
          toast.success(`Added ${grocery.item} to your list`);
          setOpen(false);
          setQuantity("1");
          setUnit("PCS");
          setShopId(undefined);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="justify-start" />}>
        {grocery.item}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {grocery.item}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
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
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Preferred shop (optional)</Label>
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
        <DialogFooter>
          <Button onClick={handleAdd} disabled={addItem.isPending}>
            {addItem.isPending ? "Adding..." : "Add to list"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
