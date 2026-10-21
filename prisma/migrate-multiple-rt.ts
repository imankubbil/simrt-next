import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hasil = await prisma.$transaction(async (tx) => {
    const konfigurasi = await tx.konfigurasiSistem.findUnique({
      where: { id: "singleton" },
    });
    if (!konfigurasi?.rt?.trim() || !konfigurasi.rw?.trim()) {
      throw new Error("Nomor RT/RW lama belum lengkap di KonfigurasiSistem.");
    }

    const nomorRt = konfigurasi.rt.trim();
    const nomorRw = konfigurasi.rw.trim();
    const kkBelumDipetakan = await tx.kartuKeluarga.findMany({
      where: { wilayahRtId: null },
      select: { rt: true, rw: true },
    });
    const kkBerbeda = kkBelumDipetakan.filter(
      (kk) => (kk.rt?.trim() && kk.rt.trim() !== nomorRt) || (kk.rw?.trim() && kk.rw.trim() !== nomorRw),
    ).length;
    if (kkBerbeda > 0) {
      throw new Error(`${kkBerbeda} KK memiliki RT/RW berbeda dari konfigurasi lama. Petakan KK tersebut sebelum menjalankan migrasi.`);
    }

    const [ketuaRwLama, ketuaRtLama] = await Promise.all([
      konfigurasi.ketuaRwId
        ? tx.warga.findUnique({ where: { id: konfigurasi.ketuaRwId }, select: { userId: true } })
        : null,
      konfigurasi.ketuaRtId
        ? tx.warga.findUnique({ where: { id: konfigurasi.ketuaRtId }, select: { userId: true } })
        : null,
    ]);
    if ((konfigurasi.ketuaRwId && !ketuaRwLama) || (konfigurasi.ketuaRtId && !ketuaRtLama)) {
      throw new Error("Data Ketua RT/RW lama tidak ditemukan. Periksa konfigurasi sebelum migrasi.");
    }
    if (ketuaRwLama && ketuaRtLama && ketuaRwLama.userId === ketuaRtLama.userId) {
      throw new Error("Satu akun tercatat sebagai Ketua RT sekaligus Ketua RW. Pisahkan penugasannya sebelum migrasi.");
    }

    const rw = await tx.wilayahRw.upsert({
      where: { nomor: nomorRw },
      update: {},
      create: {
        nomor: nomorRw,
        ketuaRwId: ketuaRwLama?.userId,
        ttdKetuaRw: konfigurasi.ttdKetuaRw,
      },
    });
    const rt = await tx.wilayahRt.upsert({
      where: { rwId_nomor: { rwId: rw.id, nomor: nomorRt } },
      update: {},
      create: {
        nomor: nomorRt,
        rwId: rw.id,
        ketuaRtId: ketuaRtLama?.userId,
        ttdKetuaRt: konfigurasi.ttdKetuaRt,
      },
    });

    if (ketuaRwLama) {
      const akunRw = await tx.user.findUnique({ where: { id: ketuaRwLama.userId }, select: { wilayahRwId: true, wilayahRtId: true } });
      if (akunRw?.wilayahRtId || (akunRw?.wilayahRwId && akunRw.wilayahRwId !== rw.id)) {
        throw new Error("Akun Ketua RW sudah memiliki penugasan wilayah lain.");
      }
      if (!akunRw?.wilayahRwId) {
        await tx.user.update({ where: { id: ketuaRwLama.userId }, data: { wilayahRwId: rw.id } });
      }
    }
    if (ketuaRtLama) {
      const akunRt = await tx.user.findUnique({ where: { id: ketuaRtLama.userId }, select: { wilayahRwId: true, wilayahRtId: true } });
      if (akunRt?.wilayahRwId || (akunRt?.wilayahRtId && akunRt.wilayahRtId !== rt.id)) {
        throw new Error("Akun Ketua RT sudah memiliki penugasan wilayah lain.");
      }
      if (!akunRt?.wilayahRtId) {
        await tx.user.update({ where: { id: ketuaRtLama.userId }, data: { wilayahRtId: rt.id } });
      }
    }

    const [warga, kk, surat] = await Promise.all([
      tx.warga.updateMany({ where: { wilayahRtId: null }, data: { wilayahRtId: rt.id } }),
      tx.kartuKeluarga.updateMany({ where: { wilayahRtId: null }, data: { wilayahRtId: rt.id } }),
      tx.surat.updateMany({ where: { wilayahRtId: null }, data: { wilayahRtId: rt.id } }),
    ]);

    const anggotaKk = await tx.anggotaKeluarga.findMany({
      select: {
        warga: { select: { wilayahRtId: true } },
        kartuKeluarga: { select: { wilayahRtId: true } },
      },
    });
    if (anggotaKk.some((anggota) => anggota.warga.wilayahRtId !== anggota.kartuKeluarga.wilayahRtId)) {
      throw new Error("Ada anggota KK dan KK dengan RT berbeda. Migrasi dibatalkan agar konsistensi data terjaga.");
    }

    return {
      rw: nomorRw,
      rt: nomorRt,
      wargaDipetakan: warga.count,
      kkDipetakan: kk.count,
      suratDipetakan: surat.count,
      ketuaRwDipindahkan: !!ketuaRwLama,
      ketuaRtDipindahkan: !!ketuaRtLama,
      ttdRwDipindahkan: !!konfigurasi.ttdKetuaRw,
      ttdRtDipindahkan: !!konfigurasi.ttdKetuaRt,
    };
  }, { maxWait: 10000, timeout: 30000 });

  console.log(JSON.stringify(hasil));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
