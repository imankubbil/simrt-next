# Phase 6: Audit kesiapan rilis multiple-RT

Status: audit read-only tersedia; audit belum dijalankan terhadap database.

## Perubahan

- `npm run db:check-multiple-rt` menghitung penugasan pengurus yang tidak valid, warga aktif/KK tanpa RT, ketidaksesuaian anggota KK, jumlah Kepala Keluarga, dan teks RT/RW yang tidak cocok dengan wilayah relasional.
- Audit juga memberi peringatan jumlah surat, pembayaran, mutasi, kegiatan, dan aset yang masih belum memiliki wilayah.
- Output hanya berisi kategori dan jumlah temuan, tanpa NIK, nama, atau ID. Temuan yang melanggar cakupan inti mengembalikan exit code `1`; catatan wilayah historis tampil sebagai peringatan.
- Script hanya menjalankan query baca. Tidak ada schema atau data yang diubah.

## Urutan kesiapan

1. Backup database.
2. Jalankan `npx prisma db push` untuk menerapkan schema multiple-RT.
3. Jalankan `npm run db:migrate-multiple-rt`, lalu `npm run db:migrate-multiple-rt-phase-3` bila migrasi/backfill tersebut belum pernah dilakukan.
4. Jalankan `npm run db:check-multiple-rt` dan selesaikan semua temuan `ERROR`.
5. Tinjau `WARN` secara manual. Data historis yang wilayahnya tidak dapat dipastikan jangan dipetakan dengan tebakan.
6. Uji akses Admin, Pengurus RW, Pengurus RT, portal warga, pindah KK, ekspor, dan cetak surat pada environment staging.

Regression test untuk helper cakupan akses ada di [Phase 7](multiple-rt-phase-7.md).

Jangan jalankan script migrasi berulang tanpa memeriksa hasil sebelumnya. Script audit aman dijalankan berulang.
