import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSharesReceivedQuery } from "@/features/shares/useSharesQuery";
import { UNIT_LABELS } from "@/lib/enums";

export function SharedWithMePage() {
  const { data, isLoading, isError } = useSharesReceivedQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Couldn't load shared lists. Please try again.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Shared With Me</h1>
      {!data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No one has shared a list with you yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((share) => (
            <Card key={share.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{share.sharedBy.name}</CardTitle>
                  <Badge variant={share.channel === "WHATSAPP" ? "default" : "secondary"}>
                    {share.channel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {share.sharedBy.phoneNumber} ·{" "}
                  {format(new Date(share.sharedAt), "PPp")}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1 text-sm">
                  {share.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.groceryName}{" "}
                        <span className="text-muted-foreground">
                          ({item.category})
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        {item.quantity} {UNIT_LABELS[item.unit]}
                        {item.shopName ? ` · ${item.shopName}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
