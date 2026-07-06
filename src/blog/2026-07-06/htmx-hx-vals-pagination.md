---
title: Persisting page size across HTMX pagination with hx-vals
date: 2026-07-06
layout: post.njk
tags:
  - post
  - htmx
  - astro
  - pagination
  - workflow
excerpt: When changing the page size in an HTMX-driven filter toolbar, clicking a pagination link would reset it — until I started passing the current page-size through hx-vals on every pagination anchor.
---

I ran into a subtle HTMX state bug today while building pagination for the Indekos Ungu dashboard.

The setup: a filter toolbar with a page-size selector (10/25/50/100) and pagination links below a data table — all HTMX-driven, no full-page reloads.

**The bug:** Change the page size from 25 to 50, and the table updates correctly. Click "Next page" — and the page-size snaps back to 25. The pagination links only carried `?page=N` in their `hx-get`, so HTMX didn't know about the current page size.

## The naive fix (don't do this)

My first thought was to include the page-size as a URL parameter on every link:

```html
<a hx-get={`?page=${page - 1}&page-size=${pageSize}`}>
```

This works for the initial render but breaks with HTMX partial swaps — the server response only contains the new content, and the browser URL doesn't update. The hidden `.filter-toolbar` form's `page-size` input is the real source of truth on subsequent requests.

## The real fix: `hx-vals`

HTMX's `hx-vals` attribute lets you inject key-value pairs into the AJAX request **without** relying on included form fields or URL params:

```html
---
const hxVals = (p: number) => JSON.stringify({ page: p, "page-size": pageSize });
---

<a
  hx-get
  hx-vals={hxVals(page - 1)}
  href={`?page=${page - 1}&page-size=${pageSize}`}
>
  «
</a>
```

`hx-vals` accepts a JSON string that gets merged into the request payload. Since it's evaluated at render time, `pageSize` (the current page size from props) is captured for every link. Now when the server receives the request, `page-size` is always present — regardless of what's in the form or URL.

## Why this matters for HTMX apps

HTMX encourages server-side rendering with partial swaps, which means **state lives in the DOM, not the URL**. `hx-vals` is the idiomatic way to lift ephemeral state (like the current page size, sort order, or active filter) into every AJAX request without duplicating hidden inputs or fighting with form serialization.

Key pattern: when a piece of UI state controls what the server renders, and that state can change independently of form submissions, pass it through `hx-vals` on every action trigger. The server is the single source of truth — it just needs the full picture on every request.
