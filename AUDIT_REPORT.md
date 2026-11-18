# KlikBeres AI — Audit & Perbaikan

**Tanggal audit:** 18 November 2026
**Tujuan:** Siap submission KaneCLI Online Hackathon

## Ringkasan

Repositori memiliki fondasi yang baik untuk demo hackathon: approval gate ditegakkan di server, task diisolasi per session, storage Neon tersedia, dan eksekusi demo tidak menghubungi website eksternal. Audit menemukan beberapa masalah yang dapat memengaruhi demo lokal, deployment, dan safety boundary ketika planner LLM aktif.

## Temuan dan perbaikan teknis

### 1. Bug frontend local yang menghentikan JavaScript

`public/app.js` memasang listener ke `#how-it-works`, tetapi elemen tersebut tidak ada di HTML. Browser melempar `TypeError` sebelum language toggle dan refresh task terpasang. `public/app.js` sekarang disamakan dengan build root yang dipakai deployment.

### 2. Output LLM belum cukup dibatasi oleh safety contract

Validasi sebelumnya hanya memeriksa bentuk JSON. Model dapat mengembalikan step approval atau execution dengan instruksi yang tidak aman namun tetap lolos. Validasi sekarang mensyaratkan approval step canonical dan execution step lokal/demo/workspace tanpa instruksi external website, submit, send, credential, payment, password, atau API key. Prompt juga memperlakukan judul pengguna sebagai untrusted data melalui `JSON.stringify`.

### 3. Session cookie malformed dapat menyebabkan error request

Cookie dengan percent-encoding rusak sebelumnya dapat membuat `decodeURIComponent` melempar exception. Parser sekarang mengabaikan nilai malformed dan hanya menerima UUID v4 yang valid.

### 4. Error response serverless tidak konsisten

Endpoint Vercel sebelumnya mengembalikan `error` sebagai string, sedangkan frontend membaca `error.message`. Semua handler sekarang memakai response terstruktur `{ error: { code, message } }`, termasuk status 413 untuk payload terlalu besar.

### 5. Live demo perlu ditinjau pada konfigurasi Vercel

Audit deployment sebelumnya mencatat URL `https://klikberes-ai.vercel.app/` masih 404. Penyebab yang perlu diperiksa adalah Root Directory yang belum diset ke `.` atau Deployment Protection yang masih aktif. Tindakan yang disarankan: pastikan Root Directory kosong/`.`, matikan Vercel Authentication bila diperlukan untuk demo, lalu redeploy.

### 6. Kane remote perlu dijalankan dari runner yang mendukung

Binary `hyperexecute` dan Chrome tidak tersedia di Termux/Android. Kane sebaiknya dijalankan dari laptop, desktop, atau GitHub Codespaces dengan deployment HTTPS terbaru.

### 7. Database dan planner LLM

Schema database sudah siap dan migrasi `tasks` beserta index telah berhasil dijalankan. Plan generation LLM bersifat opsional; tanpa API key sistem memakai local planner, sementara approval gate tetap ditegakkan di server.

## Status judging criteria

| Kriteria | Status | Catatan |
|----------|--------|---------|
| Ships | Perlu verifikasi deployment | Live URL perlu dipastikan tidak 404 dan dapat diakses reviewer |
| Verified | Belum diverifikasi remote | Kane remote belum berhasil dijalankan pada deployment terbaru |
| Closed Loop | Siap secara lokal | Protokol dan instruksi agent tersedia; remote evidence belum diklaim |
| Craft | Baik | Dokumentasi, UI, safety validation, dan regression tests tersedia |

## Verifikasi lokal

- `npm test`: 10/10 test lulus.
- Smoke test HTTP lokal: health, create, blokir execute sebelum approval, approve, execute, evidence, dan malformed cookie berhasil diverifikasi.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Syntax seluruh JavaScript: PASS.
- Syntax `scripts/kane-verify.sh`: PASS.
- Parsing `package.json` dan `vercel.json`: PASS.
- `git diff --check`: PASS.

## Rekomendasi prioritas

1. Pastikan konfigurasi Vercel (Root Directory dan Deployment Protection), lalu redeploy.
2. Jalankan Kane dari Codespaces/laptop terhadap URL HTTPS deployment terbaru.
3. Konsumsi `artifacts/kane-latest.ndjson` dan `artifacts/kane-latest.exit` sesuai `AGENTS.md`.
4. Rekam video demo 3–5 menit mengikuti `docs/DEMO_SCRIPT.md`.
5. Gunakan materi `HACKATHON.md` atau `SUBMISSION.md` untuk pengajuan.

## Batas audit

Kane remote belum dijalankan karena perubahan belum dideploy ke URL HTTPS dan kredensial/runner Kane tidak tersedia di checkout ini. Jangan mencantumkan hasil Kane sebagai lulus sampai dijalankan terhadap deployment terbaru dan evidence NDJSON benar-benar dikonsumsi sesuai `AGENTS.md`.

## File penting

- `HACKATHON.md` — teks submission
- `JUDGING.md` — alignment ke 4 kriteria
- `tests/klikberes_test.md` — Kane test
- `scripts/closed-loop-example.md` — closed loop protocol
- `POSTS.md` — draft LinkedIn + X
- `docs/DEMO_SCRIPT.md` — script video
