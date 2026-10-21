# Phase 5: Konsistensi data KK dan wilayah

Status: implementasi aplikasi selesai; tidak ada perubahan schema/database.

## Perubahan

- Nomor KK divalidasi sebagai tepat 16 digit, bukan sekadar 16 karakter.
- RT/RW KK ditetapkan dari wilayah Kepala Keluarga. Nilai wilayah tidak lagi diterima dari input form, termasuk pada request langsung.
- Edit KK mempertahankan wilayah tugas aktif dan menolak pembaruan jika KK sudah tidak berada dalam cakupan petugas.
- Kepala KK baru harus warga aktif, berada dalam cakupan petugas, dan belum terdaftar di KK lain.
- Form menampilkan bahwa wilayah mengikuti Kepala Keluarga, tanpa menambah pola visual baru di luar tampilan aplikasi yang sudah ada.

## Verifikasi

- `npx tsc --noEmit --incremental false`
- `npx prisma validate`
- `git diff --check`

Uji manual juga perlu dilakukan setelah database Phase 4 disinkronkan: buat dan edit KK, pastikan nomor RT/RW mengikuti warga terpilih, lalu uji penolakan nomor KK duplikat dan warga tidak aktif.

Audit integritas lintas wilayah sebelum rilis dilanjutkan pada [Phase 6](multiple-rt-phase-6.md).
