import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [pengurusRw, pengurusRt, wargaAktifTanpaRt, kkTanpaRt, kkList, suratTanpaRt, iuranTanpaRt, mutasiTanpaAsal, kegiatanTanpaRt, asetTanpaRt] = await Promise.all([
    prisma.user.count({ where: { role: "PENGURUS_RW", OR: [{ wilayahRwId: null }, { wilayahRtId: { not: null } }] } }),
    prisma.user.count({ where: { role: "PENGURUS_RT", OR: [{ wilayahRtId: null }, { wilayahRwId: { not: null } }] } }),
    prisma.warga.count({ where: { statusAktif: true, wilayahRtId: null } }),
    prisma.kartuKeluarga.count({ where: { wilayahRtId: null } }),
    prisma.kartuKeluarga.findMany({
      select: {
        wilayahRtId: true,
        rt: true,
        rw: true,
        wilayahRt: { select: { nomor: true, rw: { select: { nomor: true } } } },
        anggota: { select: { hubungan: true, warga: { select: { wilayahRtId: true } } } },
      },
    }),
    prisma.surat.count({ where: { wilayahRtId: null } }),
    prisma.pembayaranIuran.count({ where: { wilayahRtId: null } }),
    prisma.mutasiPenduduk.count({ where: { wilayahRtId: null } }),
    prisma.kegiatan.count({ where: { wilayahRtId: null } }),
    prisma.aset.count({ where: { wilayahRtId: null } }),
  ]);

  let anggotaBedaWilayah = 0;
  let jumlahKepalaTidakSatu = 0;
  let teksWilayahTidakSesuai = 0;
  for (const kk of kkList) {
    if (kk.anggota.some((anggota) => anggota.warga.wilayahRtId !== kk.wilayahRtId)) anggotaBedaWilayah++;
    if (kk.anggota.filter((anggota) => anggota.hubungan === "KEPALA_KELUARGA").length !== 1) jumlahKepalaTidakSatu++;
    if (kk.wilayahRt && (kk.rt !== kk.wilayahRt.nomor || kk.rw !== kk.wilayahRt.rw.nomor)) teksWilayahTidakSesuai++;
  }

  const errors = [
    ["Pengurus RW tanpa penugasan valid", pengurusRw],
    ["Pengurus RT tanpa penugasan valid", pengurusRt],
    ["Warga aktif tanpa RT", wargaAktifTanpaRt],
    ["KK tanpa RT", kkTanpaRt],
    ["Anggota KK beda RT dari KK", anggotaBedaWilayah],
    ["KK bukan tepat satu Kepala Keluarga", jumlahKepalaTidakSatu],
    ["Teks RT/RW KK berbeda dari wilayah", teksWilayahTidakSesuai],
  ] as const;
  const warnings = [
    ["Surat tanpa RT historis", suratTanpaRt],
    ["Pembayaran tanpa RT historis", iuranTanpaRt],
    ["Mutasi tanpa RT asal", mutasiTanpaAsal],
    ["Kegiatan tanpa RT", kegiatanTanpaRt],
    ["Aset tanpa RT", asetTanpaRt],
  ] as const;

  for (const [label, count] of errors) console.log(`${count ? "ERROR" : "OK"}  ${label}: ${count}`);
  for (const [label, count] of warnings) console.log(`${count ? "WARN" : "OK"}   ${label}: ${count}`);
  if (errors.some(([, count]) => count > 0)) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Audit multiple-RT gagal.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
