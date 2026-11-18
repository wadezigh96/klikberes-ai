# KlikBeres AI — Audit & Perbaikan

Tanggal audit: 18 November 2026

## Ringkasan

Repositori memiliki fondasi yang baik untuk demo hackathon: approval gate ditegakkan di server, task diisolasi per session, storage Neon tersedia, dan eksekusi demo tidak menghubungi website eksternal. Audit menemukan beberapa masalah yang dapat memengaruhi demo lokal dan safety boundary ketika planner LLM aktif.

## Temuan dan perbaikan

### 1. Bug frontend local yang menghentikan JavaScript

`public/app.js` memasang listener ke `#how-it-works`, tetapi elemen tersebut tidak ada di HTML. Browser melempar `TypeError` sebelum language toggle dan refresh task terpasang. `public/app.js` sekarang disamakan dengan build root yang dipakai deployment.

### 2. Output LLM belum cukup dibatasi oleh safety contract

Validasi sebelumnya hanya memeriksa bentuk JSON. Model dapat mengembalikan step approval atau execution dengan instruksi yang tidak aman namun tetap lolos. Validasi sekarang mensyaratkan approval step canonical dan execution step lokal/demo/workspace tanpa instruksi external website, submit, send, credential, payment, password, atau API key. Prompt juga memperlakukan judul pengguna sebagai untrusted data melalui `JSON.stringify`.

### 3. Session cookie malformed dapat menyebabkan error request

Cookie dengan percent-encoding rusak sebelumnya dapat membuat `decodeURIComponent` melempar exception. Parser sekarang mengabaikan nilai malformed dan hanya menerima UUID v4 yang valid.

### 4. Error response serverless tidak konsisten

Endpoint Vercel sebelumnya mengembalikan `error` sebagai string, sedangkan frontend membaca `error.message`. Semua handler sekarang memakai response terstruktur `{ error: { code, message } }`, termasuk status 413 untuk payload terlalu besar.

## Verifikasi

- `npm test`: 10/10 test lulus.
- Smoke test HTTP lokal: health, create, blokir execute sebelum approval, approve, execute, evidence, dan malformed cookie berhasil diverifikasi.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Syntax seluruh JavaScript: PASS.
- Syntax `scripts/kane-verify.sh`: PASS.
- Parsing `package.json` dan `vercel.json`: PASS.
- `git diff --check`: PASS.

## Batas audit

Kane remote belum dijalankan karena perubahan belum dideploy ke URL HTTPS dan kredensial/runner Kane tidak tersedia di checkout ini. Jangan mencantumkan hasil Kane sebagai lulus sampai dijalankan terhadap deployment terbaru dan evidence NDJSON dikonsumsi sesuai `AGENTS.md`.
