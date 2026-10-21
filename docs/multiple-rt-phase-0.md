# Phase 0: Aturan Wilayah dan Akses Multiple RT

Status: disepakati sebagai baseline Phase 0 pada 21 Oktober 2026.

## Tujuan

Satu instalasi SIMRTRW mengelola satu desa/kelurahan, banyak RW, dan beberapa RT di setiap RW. Data dan tindakan pengurus dibatasi berdasarkan wilayah yang menjadi tanggung jawabnya.

## Kondisi aplikasi saat ini

- `KonfigurasiSistem` hanya menyimpan satu nomor RT, satu nomor RW, satu Ketua RT, dan satu Ketua RW.
- Role akun saat ini hanya `ADMIN` dan `WARGA`.
- `Warga` belum terhubung ke RT. RT/RW pada `KartuKeluarga` masih berupa teks.
- Surat dan nomor surat menggunakan konfigurasi RT global.
- Iuran, kegiatan, inventaris, dan laporan belum dibatasi menurut RT.

## Aturan wilayah

1. Satu instalasi mewakili satu desa/kelurahan. Identitas desa, kecamatan, kabupaten, dan kode pos tetap menjadi konfigurasi global.
2. Satu desa memiliki banyak RW; satu RW memiliki banyak RT.
3. Setiap warga aktif dan setiap KK terdaftar pada tepat satu RT.
4. Anggota dalam satu KK harus berada pada RT yang sama.
5. NIK tetap unik untuk seluruh instalasi, jadi warga masuk tanpa memilih RT. Sistem menentukan wilayah dari data akunnya.

## Role dan cakupan akses

| Role | Cakupan baca | Cakupan perubahan |
|---|---|---|
| `ADMIN` | Seluruh RW dan RT di desa | Mengelola konfigurasi, unit wilayah, akun pengurus, dan seluruh data |
| `PENGURUS_RW` | Semua RT di RW yang ditugaskan | Mengelola pengurus RT dan konfigurasi RW; data operasional RT hanya diubah pengurus RT |
| `PENGURUS_RT` | RT yang ditugaskan | Mengelola warga, KK, surat, iuran, mutasi, kegiatan, dan aset di RT tersebut |
| `WARGA` | Data dirinya sendiri dan layanan miliknya | Mengajukan layanan untuk dirinya sendiri |

- Pertahankan `ADMIN` sebagai admin tingkat desa agar akun dan guard lama bisa dimigrasikan dengan perubahan lebih kecil.
- Setiap akun pengurus punya satu penugasan wilayah aktif: pengurus RT ke satu RT, pengurus RW ke satu RW.
- Semua pembatasan diberlakukan di server pada guard, Server Action, halaman data, dan API export. Filter UI hanya membantu navigasi dan bukan batas keamanan.

## Kepemilikan data

| Data | Wilayah yang disarankan |
|---|---|
| Warga | RT tempat tinggal saat ini |
| Kartu Keluarga | Satu RT; anggota KK mengikuti RT tersebut |
| Surat | RT pemohon saat surat dibuat; riwayat tetap tertaut ke RT asal |
| Iuran | RT warga saat pembayaran dicatat; riwayat pembayaran tidak ikut berubah saat warga pindah |
| Mutasi | RT asal dan/atau tujuan dicatat sebagai bagian dari kejadian mutasi |
| Kegiatan dan inventaris | Milik RT; kegiatan/aset bersama RW di luar cakupan rilis awal |
| TTD dan Ketua RT | Per RT |
| TTD dan Ketua RW | Per RW |

## Aturan pindah RT

- Perubahan RT mengganti wilayah aktif warga mulai tanggal perpindahan.
- Surat dan pembayaran lama tetap berada pada RT saat transaksi tersebut terjadi.
- Satu KK dipindah sebagai satu kesatuan agar alamat administrasi dan keanggotaan tetap konsisten.
- Perpindahan dicatat dengan tanggal dan RT asal/tujuan agar perubahan bisa ditelusuri.

## Keputusan Phase 0

- Pengurus RW dapat membaca data seluruh RT di RW-nya dan mengelola penugasan pengurus RT. Perubahan operasional warga, KK, surat, iuran, mutasi, kegiatan, dan inventaris dilakukan pengurus RT.
- Satu akun pengurus hanya memiliki satu wilayah tugas aktif pada rilis awal.
- Kegiatan dan inventaris dicatat per RT.
- Perpindahan warga dilakukan bersama seluruh anggota KK.
- Riwayat surat dan pembayaran tetap tertaut ke RT saat transaksi terjadi.

## Gerbang selesai Phase 0

Phase 0 selesai. Keputusan ini menjadi dasar relasi wilayah, role/penugasan, kepemilikan data, dan migrasi pada Phase 1-2.
