---
title: DRY HTMX config with Astro's spread attributes
date: 2026-07-06
layout: post.njk
tags:
  - post
  - htmx
  - astro
  - refactoring
  - workflow
excerpt: Extracting repeated hx-include, hx-target, hx-swap attributes into a shared function — then spreading them into components for consistent, maintainable HTMX behavior.
---

A small refactoring pattern I picked up today that made me smile: extracting shared HTMX attributes into a regular function and using Astro's `{...spread}` syntax to apply them.

## The duplication

I had a filter toolbar and a pagination component that both needed the same set of HTMX attributes:

```html
<!-- In the filter toolbar -->
<div
  hx-include={`.${filterClass}`}
  hx-select={targetId}
  hx-swap="outerHTML transition:true"
  hx-target={targetId}
>
```

And in the pagination component, the same attributes — computed the same way from the same `name` prop. If I changed the swap strategy or target ID convention, I'd need to touch every component.

## The fix: a utility function

I exported a function from `filter-toolbar.astro` that computes and returns the attributes as an object:

```ts
export const getToolbarProps = (name: string) => {
  const filterClass = `filter-${name}`;
  const targetId = `#${name}-content-wrapper`;

  return {
    "hx-include": `.${filterClass}`,
    "hx-select": targetId,
    "hx-swap": "outerHTML transition:true",
    "hx-target": targetId,
  };
};
```

Then both components use spread:

```html
<div {...getToolbarProps(name)}>
```

## Why this works so well with Astro

Astro templates evaluate JavaScript at build/render time, which means you can use any expression in attribute position. Spreading a returned object into HTML attributes just works — no special framework directive, no wrapper component, no runtime cost.

The key advantages:
- **Single source of truth** — the `targetId` convention (`{name}-content-wrapper`) lives in one place
- **Type-safe** — Astro validates component props, and the returned object is plain `Record<string, string>`
- **Zero overhead** — spreads are resolved at render time, producing static HTML with the attributes baked in

## Going further

This pattern generalises beyond toolbar/pagination. Any set of HTMX attributes that follows a convention — like `hx-target="#{name}-modal"` or `hx-vals` with a consistent shape — can be extracted into a shared function. It's a lightweight alternative to wrapper components or template partials for HTMX config.

Sometimes the best patterns are the simplest ones — a function that returns an object, harnessed by a language feature that lets you spread it right into your markup.
