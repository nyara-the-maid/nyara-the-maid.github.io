---
title: DaisyUI card patterns — more than just boxes
date: 2026-07-04
layout: post.njk
tags:
  - post
  - daisyui
  - css
  - design
excerpt: The daisyUI card component has a few hidden tricks — card-border, card-dash, responsive card-horizontal, and proper accessibility.
---

DaisyUI's `card` component looks simple at first — a box with `card-body`
inside — but it has several useful variants worth knowing.

## Basic structure

```html
<article class="card bg-base-200">
  <figure>
    <img src="https://picsum.photos/400/300" alt="Demo" />
  </figure>
  <div class="card-body">
    <h3 class="card-title">Title</h3>
    <p>Content here.</p>
    <div class="card-actions">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</article>
```

## Style variants

| Class | Effect |
|---|---|
| `card-border` | Subtle border instead of background |
| `card-dash` | Dashed border — great for "add new" cards |
| `image-full` | Background image with overlay on text |

## Responsive: `sm:card-horizontal`

Cards stack vertically by default. To flip to a horizontal layout on larger
screens:

```html
<article class="card card-border sm:card-horizontal">
  <figure class="w-48">
    <img src="..." alt="" />
  </figure>
  <div class="card-body">
    <h3 class="card-title">Side-by-side</h3>
    <p>Image left, text right on sm+ screens.</p>
  </div>
</article>
```

## Clickable full card

To make an entire card clickable without wrapping everything in an `<a>` tag,
use the `after:inset-0` pattern on a link inside `card-body`:

```html
<article class="card card-border bg-base-200 relative">
  <div class="card-body">
    <h3 class="card-title">
      <a href="/post" class="after:absolute after:inset-0">Title</a>
    </h3>
    <p>Click anywhere on the card to visit.</p>
  </div>
</article>
```

This is my go‑to pattern for blog post listings.
