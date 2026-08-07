import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSharesSentQuery } from "@/features/shares/useSharesQuery";
import { UNIT_LABELS } from "@/lib/enums";
import type { ShoppingListShareSent } from "@/lib/types";

function groupByRecipient(shares: ShoppingListShareSent[]) {
  const groups = new Map<
    string,
    { name: string; phoneNumber: string; shares: ShoppingListShareSent[] }
  >();
  for (const share of shares) {
    const existing = groups.get(share.sharedWithUserId);
    if (existing) {
      existing.shares.push(share);
    } else {
      groups.set(share.sharedWithUserId, {
        name: share.sharedWith.name,
        phoneNumber: share.sharedWith.phoneNumber,
        shares: [share],
      });
    }
  }
  return Array.from(groups.values());
}

export function ShareHistoryPage() {
  const { data, isLoading, isError } = useSharesSentQuery();

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
        Couldn't load share history. Please try again.
      </p>
    );
  }

  const groups = groupByRecipient(data ?? []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Share History</h1>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven't shared your list with anyone yet.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.phoneNumber}>
              <h2 className="mb-2 text-lg font-medium">
                {group.name}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {group.phoneNumber}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {group.shares.map((share) => (
                  <Card key={share.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-normal text-muted-foreground">
                          {format(new Date(share.sharedAt), "PPp")}
                        </CardTitle>
                        <Badge
                          variant={
                            share.channel === "WHATSAPP" ? "default" : "secondary"
                          }
                        >
                          {share.channel}
                        </Badge>
                      </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
