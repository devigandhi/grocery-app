---
name: tanstack-query-hooks
description: Use this skill whenever creating or editing a data-fetching hook in web/src/features/**, or whenever a component needs to read or mutate server data. Covers query key conventions, staleTime tuning, mutation invalidation, and the shared apiClient. Applies to both /admin/* and /app/* routes since both consume the same QueryClientProvider.
---

# TanStack Query Hook Conventions

Reference: SPEC.md section 7.2.1, CLAUDE.md "Frontend Conventions".

## Rule

Never fetch data with `useEffect` + `useState` anywhere in this codebase.
Every read goes through a `useXQuery` hook, every write through a `useXMutation` hook.

## File layout

One hook file per resource, colocated with its feature:

```
web/src/features/<resource>/use<Resource>Query.ts
web/src/features/<resource>/use<Resource>Mutations.ts
```

Resources in this project: `grocery`, `shops`, `users`, `shopping-list`, `shares`.

## Query key conventions

Arrays, namespaced by resource, most-general-first:

```ts
["grocery", "list"][("grocery", "list", { category: "Dairy" })][ // if filtered
  ("shopping-list", "me")
][("shares", "received")][("shares", "sent")][("users", userId)]; // single-entity lookup
```

## staleTime guidance

Set per resource based on how often it actually changes — don't use one
global default for everything:

| Resource               | staleTime   | Why                              |
| ---------------------- | ----------- | -------------------------------- |
| grocery catalog        | 5 min       | admin rarely edits this          |
| shops                  | 5 min       | admin rarely edits this          |
| shopping list (`me`)   | default (0) | user edits constantly            |
| shares (sent/received) | default (0) | changes whenever a share happens |
| users (admin list)     | 30s         | changes occasionally             |

## Query hook template

```ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useGroceryQuery() {
  return useQuery({
    queryKey: ["grocery", "list"],
    queryFn: async () => {
      const { data } = await apiClient.get("/grocery");
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
```

## Mutation hook template

Always invalidate the query keys the mutation affects. Think about every
page that reads that data, not just the page the mutation was triggered from.

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useAddShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: AddShoppingListItemInput) => {
      const { data } = await apiClient.post("/shopping-lists/items", item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list", "me"] });
    },
  });
}
```

## Error handling

`apiClient`'s response interceptor already normalizes NestJS errors into
`{ statusCode, message, error }`. In components, read `mutation.error?.message`
directly — don't re-parse `error.response.data` in every component.

## Checklist before considering a hook "done"

- [ ] Query key is namespaced and matches the resource name used elsewhere
- [ ] staleTime is set deliberately, not left at the global default, if the resource is slow-changing
- [ ] Every mutation invalidates every query key that could show stale data as a result
- [ ] No raw `axios`/`fetch` calls left in component files — only inside hooks
