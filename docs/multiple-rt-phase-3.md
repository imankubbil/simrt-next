# Phase 3: Guard dan cakupan data

Status: implementasi aplikasi selesai; sinkronisasi/backfill database belum dijalankan.

## Perubahan

- Login sebagai Pengurus menerima `ADMIN`, `PENGURUS_RW`, dan `PENGURUS_RT`; pilihan Warga tetap hanya menerima `WARGA`.
- Guard membaca ulang role dan penugasan wilayah dari database setiap request halaman/aksi, bukan mempercayai role di UI.
- Pengurus RT hanya membaca dan mengubah data RT yang ditugaskan. Pengurus RW dapat membaca data dalam RW tugasnya; aksi operasional RW ditolak di server. `ADMIN` tetap berwenang seluruh desa.
- Halaman data, detail, dashboard, export, dan cetak utama menerapkan filter wilayah.
- Pembuatan surat, pembayaran, mutasi, kegiatan, dan aset merekam RT pemilik agar riwayat transaksi tidak mengikuti perpindahan warga.
- Anggota KK dan kepala KK divalidasi agar berada di wilayah yang sama.

## Sinkronisasi database

Schema Phase 3 menambah `wilayahRtId` nullable pada pembayaran, mutasi, kegiatan, dan aset. Jalankan pada environment yang dituju setelah backup:

1. `npx prisma db push`
2. `npm run db:migrate-multiple-rt-phase-3`

Script backfill memetakan pembayaran/mutasi ke RT warga dan kegiatan/aset lama ke RT/RW yang masih tercatat di konfigurasi lama. Jika konfigurasi lama tidak cukup untuk memetakan aset/kegiatan, script berhenti dan meminta pemetaan manual; data tidak ditebak.

Setelah backfill, pastikan semua akun `PENGURUS_RT` memiliki `wilayahRtId` dan semua `PENGURUS_RW` memiliki `wilayahRwId`. Akun tanpa penugasan tidak dapat masuk ke area pengurus.

## Batas yang masih tersisa

- Tabel transaksi lama hanya dapat dibackfill memakai wilayah warga saat ini; bila sudah ada perpindahan RT sebelum scope transaksi direkam, wilayah historis tidak bisa direkonstruksi otomatis.
- Pengaturan serta master data global tetap khusus `ADMIN`. Pengelolaan wilayah, penugasan pengurus, tanda tangan per wilayah, dan perpindahan satu KK antar-RT dilanjutkan pada [Phase 4](multiple-rt-phase-4.md).
