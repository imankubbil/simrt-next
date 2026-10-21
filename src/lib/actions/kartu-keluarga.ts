"use server";

import { prisma } from "@/lib/prisma";
import { requireRtStaff, rtScopeWhere, wargaScopeWhere } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HubunganKeluarga } from "@prisma/client";

export async function createKartuKeluarga(formData: FormData) {
  const access = await requireRtStaff();
  const nomorKK = formData.get("nomorKK")?.toString().trim() || "";
  const alamat = formData.get("alamat")?.toString().trim() || "";
  const kodePos = (formData.get("kodePos") as string) || null;
  const kepalaWargaId = formData.get("kepalaWargaId") as string;

  if (!/^\d{16}$/.test(nomorKK)) {
    throw new Error("Nomor KK wajib 16 digit.");
  }
  if (!alamat || !kepalaWargaId) {
    throw new Error("Alamat dan Kepala Keluarga wajib diisi.");
  }

  const existingKK = await prisma.kartuKeluarga.findUnique({ where: { nomorKK } });
  if (existingKK) throw new Error("Nomor KK sudah terdaftar.");

  const warga = await prisma.warga.findFirst({
    where: { id: kepalaWargaId, statusAktif: true, ...wargaScopeWhere(access) },
    include: { wilayahRt: { include: { rw: true } } },
  });
  if (!warga?.wilayahRtId) throw new Error("Warga harus memiliki RT sebelum dimasukkan ke KK.");
  if (!warga.wilayahRt) throw new Error("RT warga tidak ditemukan.");
  const existingAnggota = await prisma.anggotaKeluarga.findUnique({ where: { wargaId: kepalaWargaId } });
  if (existingAnggota) throw new Error("Warga yang dipilih sudah terdaftar di KK lain.");

  const kk = await prisma.kartuKeluarga.create({
    data: {
      nomorKK,
      alamat,
      rt: warga.wilayahRt.nomor,
      rw: warga.wilayahRt.rw.nomor,
      kodePos,
      wilayahRtId: warga.wilayahRtId,
      anggota: {
        create: {
          wargaId: kepalaWargaId,
          hubungan: HubunganKeluarga.KEPALA_KELUARGA,
        },
      },
    },
  });

  revalidatePath("/kartu-keluarga");
  redirect(`/kartu-keluarga/${kk.id}`);
}

export async function updateKartuKeluarga(id: string, formData: FormData) {
  const access = await requireRtStaff();
  const nomorKK = formData.get("nomorKK")?.toString().trim() || "";
  const alamat = formData.get("alamat")?.toString().trim() || "";
  const kodePos = (formData.get("kodePos") as string) || null;

  if (!/^\d{16}$/.test(nomorKK)) throw new Error("Nomor KK wajib 16 digit.");
  if (!alamat) throw new Error("Alamat wajib diisi.");

  const kk = await prisma.kartuKeluarga.findFirst({
    where: { id, wilayahRt: { is: rtScopeWhere(access) } },
    include: { wilayahRt: { include: { rw: true } } },
  });
  if (!kk?.wilayahRt) throw new Error("KK tidak ditemukan atau belum memiliki RT.");
  if (await prisma.kartuKeluarga.findFirst({ where: { nomorKK, id: { not: id } }, select: { id: true } })) {
    throw new Error("Nomor KK sudah terdaftar.");
  }

  const updated = await prisma.kartuKeluarga.updateMany({
    where: { id, wilayahRt: { is: rtScopeWhere(access) } },
    data: { nomorKK, alamat, rt: kk.wilayahRt.nomor, rw: kk.wilayahRt.rw.nomor, kodePos },
  });
  if (updated.count !== 1) throw new Error("KK berubah atau berada di luar wilayah tugas.");

  revalidatePath("/kartu-keluarga");
  revalidatePath(`/kartu-keluarga/${id}`);
  redirect(`/kartu-keluarga/${id}`);
}

export async function deleteKartuKeluarga(id: string) {
  const access = await requireRtStaff();
  const kk = await prisma.kartuKeluarga.findFirst({ where: { id, wilayahRt: { is: rtScopeWhere(access) } }, select: { id: true } });
  if (!kk) throw new Error("KK tidak ditemukan atau berada di luar wilayah tugas.");
  await prisma.anggotaKeluarga.deleteMany({ where: { kartuKeluargaId: id } });
  await prisma.kartuKeluarga.delete({ where: { id } });

  revalidatePath("/kartu-keluarga");
  redirect("/kartu-keluarga");
}

export async function addAnggotaKeluarga(formData: FormData) {
  const access = await requireRtStaff();
  const kartuKeluargaId = formData.get("kartuKeluargaId") as string;
  const wargaId = formData.get("wargaId") as string;
  const hubungan = formData.get("hubungan") as HubunganKeluarga;

  if (!kartuKeluargaId || !wargaId || !hubungan) {
    throw new Error("Data anggota tidak lengkap.");
  }

  const [kk, warga] = await Promise.all([
    prisma.kartuKeluarga.findFirst({ where: { id: kartuKeluargaId, wilayahRt: { is: rtScopeWhere(access) } }, select: { wilayahRtId: true } }),
    prisma.warga.findFirst({ where: { id: wargaId, ...wargaScopeWhere(access) }, select: { wilayahRtId: true } }),
  ]);
  if (!kk || !warga || kk.wilayahRtId !== warga.wilayahRtId) throw new Error("KK dan warga harus berada di RT yang sama.");

  const existing = await prisma.anggotaKeluarga.findUnique({ where: { wargaId } });
  if (existing) throw new Error("Warga sudah terdaftar di KK lain.");

  await prisma.anggotaKeluarga.create({
    data: { kartuKeluargaId, wargaId, hubungan },
  });

  revalidatePath(`/kartu-keluarga/${kartuKeluargaId}`);
}

export async function removeAnggotaKeluarga(anggotaId: string, kartuKeluargaId: string) {
  const access = await requireRtStaff();
  const anggota = await prisma.anggotaKeluarga.findFirst({ where: { id: anggotaId, kartuKeluargaId, kartuKeluarga: { wilayahRt: { is: rtScopeWhere(access) } } } });
  if (!anggota) throw new Error("Anggota tidak ditemukan atau berada di luar wilayah tugas.");
  await prisma.anggotaKeluarga.delete({ where: { id: anggotaId } });
  revalidatePath(`/kartu-keluarga/${kartuKeluargaId}`);
}

export async function pindahkanKartuKeluarga(formData: FormData) {
  const access = await requireRtStaff();
  const kartuKeluargaId = formData.get("kartuKeluargaId")?.toString() || "";
  const targetRtId = formData.get("targetRtId")?.toString() || "";
  const tanggalStr = formData.get("tanggal")?.toString() || "";
  const tanggal = new Date(tanggalStr);
  if (!kartuKeluargaId || !targetRtId || !tanggalStr || Number.isNaN(tanggal.getTime())) {
    throw new Error("KK, RT tujuan, dan tanggal pindah wajib diisi dengan benar.");
  }

  const kk = await prisma.kartuKeluarga.findFirst({
    where: { id: kartuKeluargaId, wilayahRt: { is: rtScopeWhere(access) } },
    include: { wilayahRt: { include: { rw: true } }, anggota: { include: { warga: true } } },
  });
  if (!kk?.wilayahRtId || !kk.wilayahRt) throw new Error("KK tidak ditemukan atau belum memiliki RT asal.");
  if (kk.wilayahRtId === targetRtId) throw new Error("RT tujuan harus berbeda dari RT asal.");
  if (!kk.anggota.length || kk.anggota.some((anggota) => anggota.warga.wilayahRtId !== kk.wilayahRtId)) {
    throw new Error("Anggota KK tidak konsisten dengan RT asal. Perbaiki data sebelum memindahkan.");
  }

  const tujuan = await prisma.wilayahRt.findUnique({ where: { id: targetRtId }, include: { rw: true } });
  if (!tujuan) throw new Error("RT tujuan tidak ditemukan.");
  const rtAsalId = kk.wilayahRtId;
  const alamatAsal = `RT ${kk.wilayahRt.nomor} / RW ${kk.wilayahRt.rw.nomor}`;
  const wargaIds = kk.anggota.map((anggota) => anggota.wargaId);

  await prisma.$transaction(async (tx) => {
    const dipindah = await tx.warga.updateMany({
      where: { id: { in: wargaIds }, wilayahRtId: rtAsalId },
      data: { wilayahRtId: tujuan.id },
    });
    if (dipindah.count !== wargaIds.length) throw new Error("Sebagian anggota berubah saat proses pindah. Tidak ada data yang dipindahkan.");

    const kkDipindah = await tx.kartuKeluarga.updateMany({
      where: { id: kk.id, wilayahRtId: rtAsalId },
      data: { wilayahRtId: tujuan.id, rt: tujuan.nomor, rw: tujuan.rw.nomor },
    });
    if (kkDipindah.count !== 1) throw new Error("KK berubah saat proses pindah. Tidak ada data yang dipindahkan.");
    await tx.mutasiPenduduk.createMany({
      data: wargaIds.map((wargaId) => ({
        wargaId,
        kartuKeluargaId: kk.id,
        jenisMutasi: "PINDAH_KELUAR",
        tanggal,
        alamatAsal,
        alamatTujuan: `RT ${tujuan.nomor} / RW ${tujuan.rw.nomor}`,
        keterangan: `Pindah KK ${kk.nomorKK}`,
        createdById: access.userId,
        wilayahRtId: rtAsalId,
        wilayahRtTujuanId: tujuan.id,
      })),
    });
  });

  revalidatePath("/kartu-keluarga");
  revalidatePath(`/kartu-keluarga/${kk.id}`);
  revalidatePath("/warga");
  revalidatePath("/mutasi");
  redirect(`/kartu-keluarga/${kk.id}`);
}
