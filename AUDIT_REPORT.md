# KlikBeres AI — Audit & Perbaikan

**Tanggal audit:** 18 November 2026  
**Tujuan:** Siap submission KaneCLI Online Hackathon

## Ringkasan

Repositori memiliki fondasi yang baik untuk demo hackathon: approval gate di server, task diisolasi per session, storage Neon tersedia, dan eksekusi demo tidak menghubungi website eksternal. Audit menemukan beberapa masalah yang dapat memengaruhi demo lokal dan safety boundary ketika planner LLM aktif.

## Temuan Utama

### 1. Live demo masih 404 di domain custom
- URL `https://klikberes-ai.vercel.app/` masih 404.
- Penyebab kemungkinan: Root Directory belum di-set ke `.` atau Deployment Protection masih aktif.
- **Perbaikan:** Di Vercel Settings → General → Root Directory = kosong/`.` → matikan Vercel Authentication → Redeploy.

### 2. Kane remote tidak bisa dijalankan di Termux
- Binary `hyperexecute` tidak support Android.
- Chrome juga tidak tersedia di Termux.
- **Perbaikan:** Jalankan Kane dari laptop, desktop, atau GitHub Codespaces.

### 3. Database schema sudah siap
- `npm run db:migrate` berhasil.
- Tabel `tasks` + index sudah terbuat di Neon.
- **Status:** OK.

### 4. LLM plan generation opsional
- Fallback ke local planner jika tidak ada API key.
- Approval gate tetap di server.
- **Status:** Aman untuk demo.

## Status Judging Criteria

| Kriteria | Status | Catatan |
|----------|--------|---------|
| Ships | ⚠️ | Live URL perlu diperbaiki |
| Verified | ❌ | Kane remote belum berhasil (platform) |
| Closed Loop | ✅ | Protokol + instruksi agent ada |
| Craft | ✅ | Dokumentasi + UI cukup rapi |

## Rekomendasi Prioritas

1. **Fix live demo** (Root Directory + redeploy) — paling penting untuk Ships.
2. **Jalankan Kane dari Codespaces / laptop** — untuk skor Verified.
3. **Rekam video 3–5 menit** (ikuti `docs/DEMO_SCRIPT.md`).
4. **Post minimal 2 kali** (draft di `POSTS.md`).
5. **Submit** dengan teks dari `HACKATHON.md` atau `SUBMISSION.md`.

## File Penting

- `HACKATHON.md` — teks submission
- `JUDGING.md` — alignment ke 4 kriteria
- `tests/klikberes_test.md` — Kane test
- `scripts/closed-loop-example.md` — closed loop protocol
- `POSTS.md` — draft LinkedIn + X
- `docs/DEMO_SCRIPT.md` — script video
