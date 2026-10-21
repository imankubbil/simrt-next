import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$transaction(async (tx) => {
    const config = await tx.konfigurasiSistem.findUnique({ where: { id: "singleton" } });
    const legacyRt = config?.rt?.trim();
    const legacyRw = config?.rw?.trim();
    const legacyUnit = legacyRt && legacyRw
      ? await tx.wilayahRt.findFirst({ where: { nomor: legacyRt, rw: { nomor: legacyRw } }, select: { id: true } })
      : null;

    const [payments, mutations, events, assets] = await Promise.all([
      tx.pembayaranIuran.findMany({ where: { wilayahRtId: null }, select: { id: true, warga: { select: { wilayahRtId: true } } } }),
      tx.mutasiPenduduk.findMany({ where: { wilayahRtId: null }, select: { id: true, warga: { select: { wilayahRtId: true } } } }),
      tx.kegiatan.count({ where: { wilayahRtId: null } }),
      tx.aset.count({ where: { wilayahRtId: null } }),
    ]);

    if ((events || assets) && !legacyUnit) {
      throw new Error("Kegiatan/aset lama ditemukan tetapi RT/RW lama tidak dapat dipetakan dari konfigurasi. Petakan manual terlebih dahulu.");
    }

    for (const payment of payments) {
      if (!payment.warga.wilayahRtId) throw new Error(`Pembayaran ${payment.id} terkait warga tanpa RT; petakan manual.`);
      await tx.pembayaranIuran.update({ where: { id: payment.id }, data: { wilayahRtId: payment.warga.wilayahRtId } });
    }
    for (const mutation of mutations) {
      if (!mutation.warga.wilayahRtId) throw new Error(`Mutasi ${mutation.id} terkait warga tanpa RT; petakan manual.`);
      await tx.mutasiPenduduk.update({ where: { id: mutation.id }, data: { wilayahRtId: mutation.warga.wilayahRtId } });
    }

    if (legacyUnit) {
      await Promise.all([
        tx.kegiatan.updateMany({ where: { wilayahRtId: null }, data: { wilayahRtId: legacyUnit.id } }),
        tx.aset.updateMany({ where: { wilayahRtId: null }, data: { wilayahRtId: legacyUnit.id } }),
      ]);
    }

    return {
      pembayaranDipetakan: payments.length,
      mutasiDipetakan: mutations.length,
      kegiatanDipetakan: events,
      asetDipetakan: assets,
    };
  }, { maxWait: 10000, timeout: 30000 });

  console.log(JSON.stringify(result));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
