# Phase 4: Pengelolaan wilayah dan perpindahan KK

Status: implementasi aplikasi selesai; sinkronisasi database belum dijalankan.

Membaca alur ini sebagai administrasi desa yang terautentikasi, dengan pola visual SIMRTRW yang sudah ada. Antarmuka menjaga navigasi jelas untuk Admin dan Pengurus RW, form nyaman digunakan di layar kecil, serta tanda tangan tetap per wilayah.

## Perubahan

- Admin dapat menambah RW dan RT, membuat akun Pengurus RW/RT, mengubah penugasan, menetapkan ketua wilayah, dan mengunggah atau menghapus tanda tangan Ketua RW/RT.
- Pengurus RW hanya dapat membuat dan memindahkan penugasan akun Pengurus RT dalam RW tugasnya. Pengurus RT tidak mendapat akses ke layar pengelolaan wilayah.
- Perpindahan KK dilakukan satu keluarga sekaligus. Semua anggota harus konsisten berada di RT asal; data warga dan KK berpindah dalam satu transaksi.
- Setiap anggota memperoleh catatan mutasi dengan RT asal dan RT tujuan. Catatan asal tetap melekat pada wilayah awal untuk kebutuhan riwayat.
- Cetak surat dapat memakai ketua dan tanda tangan sesuai wilayah yang terkait.

## Sinkronisasi database

Schema menambah kolom nullable `wilayahRtTujuanId` beserta relasi pada tabel mutasi. Setelah backup, jalankan:

1. `npx prisma db push`
2. `npm run db:migrate-multiple-rt-phase-3` jika backfill Phase 3 belum pernah dijalankan.

Kolom wilayah tujuan untuk mutasi lama tetap null karena tujuan historis tidak dapat dipastikan dari data yang tersedia. Tidak diperlukan backfill Phase 4 untuk kolom nullable ini.

## Verifikasi setelah deploy

- Uji akses Admin, Pengurus RW, dan Pengurus RT; pastikan Pengurus RW tidak dapat mengubah data di RW lain melalui form atau request langsung.
- Uji pindah KK multianggota dan pastikan semua warga, KK, serta catatan asal-tujuan konsisten.
- Uji unggah/hapus tanda tangan RW dan RT lalu cetak surat dari wilayah terkait.

## Berikutnya

Hardening agar nilai RT/RW KK selalu mengikuti wilayah Kepala Keluarga dilanjutkan pada [Phase 5](multiple-rt-phase-5.md).
