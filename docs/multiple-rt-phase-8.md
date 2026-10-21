# Phase 8: Guard penugasan fail-closed

Status: implementasi dan test regresi selesai.

## Perubahan

- Satu helper memvalidasi role dan pasangan wilayah pengurus.
- Pengurus RW wajib punya tepat satu RW dan tidak boleh punya penugasan RT; Pengurus RT wajib punya tepat satu RT dan tidak boleh punya penugasan RW.
- Login, validasi ulang JWT, dan guard request menolak akun pengurus dengan penugasan kosong atau tercampur. Perbaikannya harus dilakukan oleh Admin melalui pengaturan wilayah.
- Test regresi mencakup pasangan yang valid dan tidak valid tanpa mengakses database.

## Verifikasi

- `npm test`
- `npx tsc --noEmit --incremental false`

Validasi berlaku di login dan setiap request, sehingga perubahan data penugasan langsung mencabut akses sesi yang tidak lagi valid.

Pengaturan tanda tangan mandiri untuk RW tugas dilanjutkan pada [Phase 9](multiple-rt-phase-9.md).
