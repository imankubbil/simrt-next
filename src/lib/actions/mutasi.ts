"use server";

import { prisma } from "@/lib/prisma";
import { assertWargaInScope, requireRtStaff, rtScopeWhere } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { JenisMutasi } from "@prisma/client";

export async function createMutasi(formData: FormData) {
  const access = await requireRtStaff();
  const wargaId = formData.get("wargaId") as string;
  const jenisMutasi = formData.get("jenisMutasi") as JenisMutasi;
  const tanggalStr = formData.get("tanggal") as string;
  const keterangan = (formData.get("keterangan") as string) || null;
  const alamatTujuan = (formData.get("alamatTujuan") as string) || null;
  const alamatAsal = (formData.get("alamatAsal") as string) || null;
  const tempatMeninggal = (formData.get("tempatMeninggal") as string) || null;
  const penyebab = (formData.get("penyebab") as string) || null;

  if (!wargaId || !jenisMutasi || !tanggalStr) {
    throw new Error("Warga, jenis mutasi, dan tanggal wajib diisi.");
  }
  const warga = await assertWargaInScope(access, wargaId);
  if (!warga.wilayahRtId) throw new Error("Warga belum memiliki RT.");

  await prisma.$transaction(async (tx) => {
    await tx.mutasiPenduduk.create({
      data: {
        wargaId,
        wilayahRtId: warga.wilayahRtId,
        jenisMutasi,
        tanggal: new Date(tanggalStr),
        keterangan,
        alamatTujuan,
        alamatAsal,
        tempatMeninggal,
        penyebab,
        createdById: access.userId,
      },
    });

    if (jenisMutasi === "MENINGGAL" || jenisMutasi === "PINDAH_KELUAR") {
      await tx.warga.update({
        where: { id: wargaId },
        data: {
          statusAktif: false,
          kategoriTidakAktif: jenisMutasi === "MENINGGAL" ? "Meninggal" : "Pindah Keluar",
        },
      });
    }
  });

  revalidatePath("/mutasi");
  revalidatePath("/warga");
  redirect("/mutasi");
}

export async function deleteMutasi(id: string) {
  const access = await requireRtStaff();
  const result = await prisma.mutasiPenduduk.deleteMany({ where: { id, wilayahRt: { is: rtScopeWhere(access) } } });
  if (!result.count) throw new Error("Mutasi tidak ditemukan atau berada di luar wilayah tugas.");
  revalidatePath("/mutasi");
}
