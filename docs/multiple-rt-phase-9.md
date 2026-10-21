# Phase 9: Pengaturan mandiri tingkat RW

Status: implementasi dan regression test selesai.

## Perubahan

- Ketua RW dapat mengunggah atau menghapus tanda tangannya setelah Admin menetapkan akun tersebut sebagai Ketua RW.
- Server Action memeriksa role, kecocokan `wilayahRwId`, dan identitas Ketua RW, jadi Pengurus RW lain tidak dapat mengubah tanda tangan atau bertindak atas nama Ketua.
- Admin tetap dapat mengelola semua tanda tangan RW; Pengurus RT tetap tidak memiliki akses.
- Form mengikuti pola yang sudah ada dan hanya ditampilkan kepada Ketua RW yang ditetapkan untuk RW tugasnya. Admin tetap mengelola semua RW.

## Verifikasi

- `npm test` mencakup Admin, RW yang sesuai, RW lain, dan Pengurus RT.
- `npx tsc --noEmit --incremental false`

Tidak ada perubahan schema atau database. Uji unggah/hapus aktual dan cetak surat tetap perlu dilakukan di staging.
