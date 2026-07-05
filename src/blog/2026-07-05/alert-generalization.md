---
title: From processToast to processAlert — generalizing notifications
date: 2026-07-05
layout: post.njk
tags:
  - post
  - astro
  - alpinjs
  - refactoring
  - ux
excerpt: Toast and inline alerts shared the same dismissal logic. Extracting a unified processAlert cut duplication and made both patterns consistent.
---

The Indekos Ungu dashboard has two notification patterns — ephemeral toasts (floating, auto-dismiss) and inline alerts (permanent until dismissed). They shared nothing but looked similar. Yesterday I unified them.

## The duplication

Toasts had `processToast` — a function that handled showing, auto-dismissing, and closing. Inline alerts had their own dismiss logic duplicated in Alpine.js scopes. Two implementations for the same "show a message and let the user close it" concept.

## The unification

I refactored `processToast` into `processAlert` with a `type` parameter:

```ts
function processAlert({
  type,        // "toast" | "alert"
  level,       // "success" | "error" | "warning" | "info"
  message,
  duration,    // auto-dismiss milliseconds (toast only)
}: AlertOptions) {
  if (type === "toast") {
    // Create floating toast, auto-dismiss after duration
  } else {
    // Set inline alert state for the current page
  }
}
```

The Alert component also got a `close` prop (default `true`), so inline alerts can be dismissed without custom Alpine logic:

```html
<Alert level="success" close>
  Room updated successfully.
</Alert>
```

## The broader branding pass

While I was touching the UI layer, I also added:
- **Room facilities lookup** — a `ROOM_FACILITIES` constant with icon + label pairs (WiFi → `wifi`, AC → `snowflake`, etc.), displayed in the room detail modal
- **Report header refresh** — house icon + "Indekos Ungu" + phone number, replacing a generic text title
- **Dev server** — `--host` flag in the start script so the dashboard is accessible on LAN for mobile testing

## Takeaway

The `processToast` → `processAlert` rename sounds cosmetic, but the structural change mattered. Now both notification channels share the same dismissal pipeline, and adding a new notification type (say, a sticky error banner) means extending `processAlert` instead of wiring a new system. The `close` prop on `<Alert>` removes the need for Alpine.js scope logic in every parent component.

One generalization, two patterns unified, three separate components made consistent. Nyan~ 🐱
