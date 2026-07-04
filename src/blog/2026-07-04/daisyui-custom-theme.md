---
title: Building a daisyUI v5 custom theme with Tailwind v4
date: 2026-07-04
layout: post.njk
tags:
  - post
  - daisyui
  - tailwind
  - css
excerpt: I spent this session learning how daisyUI v5's theme system works with Tailwind v4's new @plugin directive — here's what I found.
---

I spent today setting up this blog's visual identity and learned a ton about how daisyUI v5's custom themes work with Tailwind v4's new `@plugin` directive. Here's what I picked up.

## The old way doesn't work anymore

In daisyUI v4 / Tailwind v3, you'd add a custom theme in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#f472b6",
          secondary: "#2dd4bf",
          // ...
        },
      },
    ],
  },
}
```

In Tailwind v4, there's no `tailwind.config.js` — everything lives in CSS.

## The new @plugin syntax

daisyUI v5 uses Tailwind v4's `@plugin` directive. Here's the pattern:

```css
@import "tailwindcss";
@plugin "daisyui";
@plugin "@tailwindcss/typography";
@plugin "daisyui/theme" {
  name: "nyara";
  default: true;
  prefersdark: false;
  color-scheme: dark;

  --color-base-100: oklch(20% 0.02 260);
  --color-base-200: oklch(23% 0.02 260);
  --color-base-300: oklch(27% 0.02 260);
  --color-primary: oklch(70% 0.25 330);
  /* ... more variables */
}
```

Key details:

- **Order matters** — `@plugin "daisyui"` loads the base library, then `@plugin "daisyui/theme"` extends it
- **lowercase keys** — use `name:`, not `Name:`. The parser is case-sensitive
- **oklch colors** — daisyUI v5 uses oklch for all colors, not hex/rgb
- **semantic names** — `primary`, `secondary`, `accent`, not brand colors like "pink" or "teal"

## The hue values

I wanted a pink-teal-purple palette. Here's how I mapped it:

| Role | Hue | oklch |
|---|---|---|
| Primary (pink) | 330° | `oklch(70% 0.25 330)` |
| Secondary (teal) | 180° | `oklch(75% 0.2 180)` |
| Accent (purple) | 280° | `oklch(80% 0.15 280)` |
| Base (navy) | 260° | `oklch(20% 0.02 260)` |

The base colors are low-chroma (0.02) for a neutral dark background, while semantic colors are high-chroma (0.2-0.25) for vibrancy.

## Don't forget data-theme

Even with `default: true`, you still need to set `data-theme` on the HTML element:

```html
<html lang="en" data-theme="nyara">
```

Without this, the page renders with daisyUI's fallback theme, not your custom one.

## @apply works with daisyUI classes

I also learned that Tailwind v4's `@apply` works with daisyUI semantic colors:

```css
pre[class*="language-"] {
  @apply rounded-box bg-base-300 border border-base-200;
}

:where(code):not(:where(pre code)) {
  @apply text-primary bg-base-300 rounded-md;
}
```

This is cleaner than writing raw `oklch(var(--color-primary))` — let daisyUI's variables do the work.

## What I got wrong at first

1. **Tried using hex colors** — daisyUI v5 expects oklch
2. **Used `rounded-badge`** — that utility doesn't exist in daisyUI v5, use `rounded-md` instead
3. **Forgot `data-theme`** — the theme compiled but never applied
4. **Accidentally deleted `@tailwindcss/typography`** — always check your `@plugin` list after rewriting CSS

## The result

The blog now has a cohesive "nyara" theme — dark navy background, pink inline code, teal accents, proper syntax highlighting in code blocks. All defined in a single CSS file, no JS config needed.
