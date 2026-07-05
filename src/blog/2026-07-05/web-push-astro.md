---
title: Web Push notifications with Astro + service workers
date: 2026-07-05
layout: post.njk
tags:
  - post
  - astro
  - web-push
  - service-worker
  - notifications
excerpt: Setting up end-to-end web push notifications in Astro — VAPID keys, service worker, Astro actions for subscribe/unsubscribe, and a scheduler worker for monthly report delivery.
---

Yesterday I implemented a full web push notification system for the Indekos Ungu dashboard. The flow goes: browser subscription → Astro action store → scheduler trigger → service worker display. Here's how the pieces fit together.

## VAPID setup

Web push requires VAPID keys for identification. The `web-push` library handles the crypto:

```ts
import { initPush, sendPush } from "@indekos/utilities/push";

initPush(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
```

Keys live in env vars — public goes to the client for `PushManager.subscribe()`, private stays server-side for sending. Astro's `astro:env` makes the split clean:

```ts
import { VAPID_PUBLIC_KEY } from "astro:env/client";
import { VAPID_PRIVATE_KEY, VAPID_SUBJECT } from "astro:env/server";
```

## Subscription schema

A `push_subscriptions` table stores per-user subscriptions with endpoint + auth + p256dh keys. The Astro action handles the subscribe flow:

```ts
export const subscribe = defineAction({
  accept: "json",
  input: z.object({
    endpoint: z.url(),
    keys: z.object({ auth: z.string(), p256dh: z.string() }),
  }),
  handler: async (input, context) => {
    const user = context.locals.user!;
    await db.insert(pushSubscriptions).values({
      userId: user.id,
      endpoint: input.endpoint,
      authKey: input.keys.auth,
      p256dhKey: input.keys.p256dh,
    });
    // audit log, unsubscription cleanup...
  },
});
```

## Service worker

The `sw.js` handles incoming push events and notification clicks:

```js
self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon.png",
    data: { url: data.url },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  clients.openWindow(event.notification.data.url);
});
```

Astro serves the SW file from `public/sw.js`. No build step needed — it's a vanilla JS file with no imports.

## Monthly report delivery

The scheduler worker generates a monthly report, then sends push to all subscribed admins:

```ts
const subscriptions = await db.select().from(pushSubscriptions);
for (const sub of subscriptions) {
  await sendPush(sub, {
    title: "Laporan Bulanan",
    body: `Report for ${month} is ready`,
    url: "/dashboard/report",
  });
}
```

## Permission prompts in the UI

The client-side code requests permission on login, shows a subtle dismissable banner (not an aggressive `Notification.requestPermission()` on page load), and registers the service worker. The whole experience is opt-in and graceful — if permission is denied, the banner doesn't reappear.

The notification dropdown in the dashboard layout shows recent push audit logs with a badge count, and clicking a notification navigates to the relevant page.

A useful end-to-end pattern, especially the `astro:env` client/server split and the Astro actions paradigm for mutation endpoints — no REST routes needed.
