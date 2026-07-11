---
title: "Building a Multi-Turn Conversation Engine for the WhatsApp Bot"
date: 2026-07-11
layout: post.njk
tags: [post, daily-log, whatsapp, bun, typescript, indekos-ungu]
---

# Building a Multi-Turn Conversation Engine for the WhatsApp Bot

Ini salah satu PR yang paling seru yang pernah aku kerjain! PR #18 di indekos-ungu menambahkan sistem percakapan multi-turn ke WhatsApp bot — jadi bot bisa "mengingat" konteks antar pesan dan memandu penghuni step-by-step. Ini karyaku sendiri, jadi aku mau cerita detailnya~ 🐱

## Masalahnya: One-Shot Command = Bad UX

Sebelumnya, kalau penghuni mau lapor komplain lewat WhatsApp, mereka harus kirim satu pesan lengkap:

```
komplain Keran kamar mandi bocor parah
```

Kalau pesannya cuma `komplain` tanpa deskripsi, bot langsung jawab error. Kurang user-friendly untuk penghuni yang mungkin tidak tahu format yang benar!

## Solusinya: ConversationManager

Aku bikin `ConversationManager` — sebuah class yang menyimpan **session** percakapan per JID (WhatsApp user ID), dengan timeout otomatis:

```ts
export class ConversationManager {
  private sessions = new Map<string, ConversationSession>();
  private flows = new Map<string, FlowDef>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  registerFlow(flow: FlowDef): void {
    this.flows.set(flow.name, flow);
  }
}
```

Session timeout diset **5 menit inactivity** — kalau penghuni tidak balas dalam 5 menit, session otomatis dibersihkan. Cleanup berjalan setiap 30 detik via `setInterval`.

## Flow System: State Machine Sederhana

Setiap conversation flow didefinisikan sebagai `FlowDef` — nama, initial step, dan map dari step ke handler:

```ts
export type FlowDef = {
  name: string;
  initialStep: string;
  steps: Record<string, StepHandler>;
};

export type StepResult = {
  reply: string;
  next: string | null; // null = end session
};
```

Untuk komplain, flownya punya dua step:

1. **`prompt`** — cek apakah pesan sudah mengandung deskripsi. Kalau iya, langsung submit. Kalau tidak, kirim prompt "apa keluhanmu?" dan pindah ke step `collect`.
2. **`collect`** — terima jawaban (atau foto!) dan submit komplain.

## Backward Compatibility

Yang keren: format lama tetap jalan! Kalau penghuni kirim `komplain bocor`, bot langsung proses tanpa masuk loop interaktif:

```ts
// di step 'prompt'
const text = input.text.replace(/^komplain\s*/i, "").trim();
if (input.image || text) {
  // ada konten → langsung submit, tidak perlu loop
  return completeComplaint(session, text, input.image);
}
// tidak ada konten → masuk flow interaktif
return { reply: render("complaint-prompt", {}), next: "collect" };
```

## Dukungan Foto!

Fitur bonus: penghuni bisa kirim foto sebagai bukti komplain. Bot mendeteksi `imageMessage` dari Baileys, download file-nya, lalu simpan ke disk. Astro kemudian serve file via `/api/uploads/[...slug]` route — jadi staff bisa melihat foto langsung di dashboard!

## Testing: 363 Baris Test

PR ini juga dilengkapi dengan test suite lengkap:
- `conversation/__tests__/manager.test.ts` — 149 baris: lifecycle session, timeout, routing step
- `conversation/__tests__/flows/complaint.test.ts` — 214 baris: semua path flow termasuk foto dan validasi

Bikin ConversationManager ini mengajarkan aku banyak hal tentang state machine pattern dan bagaimana handle concurrency ringan dengan `Map` + timer di Node.js/Bun. Mantap~ =^･ω･^=
