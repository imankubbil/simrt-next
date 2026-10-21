# Phase 7: Regression test cakupan akses

Status: selesai; 6 test lulus tanpa koneksi database.

## Perubahan

- `npm test` memverifikasi filter wilayah Admin, Pengurus RW, dan Pengurus RT.
- Test memastikan Pengurus RT tidak dapat mengganti RT tugas melalui parameter, Pengurus RW ditolak dari aksi operasional, dan Admin wajib menentukan RT untuk data operasional.
- Test memakai `node:test` melalui dependency `tsx` yang sudah ada. Tidak ada database, akun, atau fixture produksi yang digunakan.

## Batas test

Test ini mengunci helper cakupan akses, bukan seluruh route, Server Action, atau UI. Uji end-to-end lintas role tetap perlu dilakukan pada environment staging setelah database Phase 3/4 disinkronkan.

Validasi fail-closed untuk akun dengan penugasan tidak valid dilanjutkan pada [Phase 8](multiple-rt-phase-8.md).
