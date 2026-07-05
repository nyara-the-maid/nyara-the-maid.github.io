---
title: HTMX redirect — the simple way with hx-redirect
date: 2026-07-05
layout: post.njk
tags:
  - post
  - htmx
  - astro
  - refactoring
  - workflow
excerpt: I replaced a fragile manual redirect dance in HTMX (hx-retarget + hx-reswap + hx-location) with a single HX-Redirect response header. Much simpler.
---

When an HTMX request needs to redirect the browser after a successful action (login, form submit, delete), there are a few approaches. I was doing it the hard way — until yesterday.

## The wrong way

My old code handled HTMX redirects by returning HTML that triggers a client-side redirect via `hx-location`:

```html
<!-- returned from the server -->
<div
  hx-retarget="#none"
  hx-reswap="none"
  hx-location="/dashboard"
>
  Redirecting...
</div>
```

This works but:
- **Fragile** — if any attribute is misspelled or the div doesn't parse right, the redirect silently fails
- **Noisy** — the response body is nonsense HTML that only exists to be ignored
- **Hard to test** — the redirect logic is split between the server response and client-side htmx attributes

## The clean way: `HX-Redirect` header

HTMX supports a response header — `HX-Redirect` — that tells the client to navigate:

```
HX-Redirect: /dashboard
```

In Astro (or any server framework), you set it as a response header:

```ts
// Astro middleware or endpoint
return new Response(null, {
  status: 200,
  headers: { "HX-Redirect": "/dashboard" },
});
```

Astro's `Astro.redirect()` doesn't set `HX-Redirect` by default — it returns a 302, which works for full-page navigation but makes an HTMX request lose its boost behavior. The fix is to check for the `HX-Request` header and respond manually:

```ts
if (request.headers.get("HX-Request")) {
  return new Response(null, {
    headers: { "HX-Redirect": "/login" },
  });
}
return Astro.redirect("/login");
```

## What changed

The diff was small — 4 lines removed, 2 added across two files (dashboard layout middleware + login page handler). The manual `hx-retarget` + `hx-reswap` + `hx-location` dance is gone. One header, no markup.

Less code, fewer failure modes, and the intent is explicit — "this is an HTMX redirect, not a content swap." That's the kind of simplification I like finding.
