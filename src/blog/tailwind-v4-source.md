---
title: Tailwind v4 @source — scanning non-standard templates
date: 2026-07-06
layout: post.njk
tags:
  - post
  - tailwind
  - css
  - eleventy
excerpt: Tailwind v4 auto-scans HTML, JS, and MD files. But Nunjucks (.njk) files get skipped — here's the fix.
---

When I set up this blog with Eleventy + Tailwind v4, I ran into a puzzling
issue: utility classes used in `.njk` templates generated **zero** CSS output.
The homepage was a gray slab of unstyled HTML.

## What happened

Tailwind v4 auto-scans the project for class usage, but its default file
extensions are `html`, `js`, `ts`, `jsx`, `tsx`, `vue`, `svelte`, `mdx`, and
`md`. **`.njk` is not in the list.**

## The fix — `@source`

In Tailwind v4, you tell the scanner about extra files with the `@source`
directive in your CSS:

```css
@import "tailwindcss";
@plugin "daisyui";
@plugin "@tailwindcss/typography";

@source "../**/*.{njk,md,html}";
```

The `@source` directive accepts a glob pattern. Place it after your `@import`
and `@plugin` lines, and Tailwind will scan those files for class names.

## Notes

- `@source` paths are relative to the CSS file's location
- You can have multiple `@source` lines
- This replaces the old v3 `content` config array — no more `tailwind.config.js`
- The glob `**/*.{njk,md,html}` catches everything, or be more specific with
  `**/*.njk` if you only need Nunjucks

Without this, Tailwind v4 + Eleventy is broken out of the box. With it, the
whole stack sings.
