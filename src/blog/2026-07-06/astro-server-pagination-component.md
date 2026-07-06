---
title: Building reusable server-side pagination in Astro
date: 2026-07-06
layout: post.njk
tags:
  - post
  - astro
  - pagination
  - htmx
  - typescript
excerpt: A generic pagination component + paginateArray utility that powers 7+ index pages — consistent, type-safe, and HTMX-friendly.
---

Today I built a reusable server-side pagination system for the Indekos Ungu dashboard. Seven pages — manage tenants, rooms, complaints; audit and chatbot logs; notifications and transaction reports — all share the same pagination logic.

## The core utility: `paginateArray`

The engine is a generic function in `query.ts` that slices an array and returns metadata:

```ts
export interface PaginationResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginateArray<T>(
  items: T[],
  { page, "page-size": pageSize }: z.infer<...>,
): PaginationResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}
```

Key design decisions:
- **Clamps `page`** — `Math.min(page, totalPages)` prevents navigating past the last page even if the user bookmarks a stale URL
- **Zod schema** — `page-size` is coerced from strings (URL params), maxed at 100, defaults to 10
- **Generic `<T>`** — works with any entity type; no casting needed

## The component

The `Pagination` Astro component renders prev/next buttons, page numbers (with ellipsis for large ranges), and a summary like "1–25 dari 142":

```astro
---
import type { PaginationResult } from "~/lib/query";
import { getToolbarProps } from "./filter-toolbar.astro";

export interface Props extends Omit<PaginationResult<any>, "items"> {
  name: string;
}

const { name, page, totalPages, total, pageSize } = Astro.props;
const pages: number[] = [];
const startPage = Math.max(1, page - 2);
const endPage = Math.min(totalPages, page + 2);
for (let i = startPage; i <= endPage; i++) pages.push(i);

const hxVals = (p: number) => JSON.stringify({ page: p, "page-size": pageSize });
---
```

Each page link uses `hx-vals` to carry the current page size (see my other post for why that matters). The layout is responsive — wraps to a column on small screens via Tailwind's `max-sm:flex-col`.

## Wiring it up per page

Every page follows the same pattern — `_data.ts` exports a function that fetches and paginates, the Astro page calls it and passes the result to both the table and the pagination component:

```ts
// _data.ts
export async function getTenants(context) {
  const all = await db.query.tenants.findMany(...);
  const { page, pageSize, ... } = parsePagination(context.url);
  return paginateArray(all, { page, page-size: pageSize });
}
```

```astro
---
const result = await getTenants(Astro);
---
<DataTable items={result.items} columns={columns} />
<Pagination {...result} name="tenants" />
```

This pattern made adding pagination to the 7th page just as cheap as the first — copy the `_data.ts` pattern, wire the props, done. Consistency means fewer surprises for users switching between pages.
