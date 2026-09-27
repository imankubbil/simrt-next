"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { JenisMutasi } from "@prisma/client";

export async function createMutasi(formData: FormData) {
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

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("User Admin tidak ditemukan.");

  await prisma.mutasiPenduduk.create({
    data: {
      wargaId,
      jenisMutasi,
      tanggal: new Date(tanggalStr),
      keterangan,
      alamatTujuan,
      alamatAsal,
      tempatMeninggal,
      penyebab,
      createdById: admin.id,
    },
  });

  if (jenisMutasi === "MENINGGAL" || jenisMutasi === "PINDAH_KELUAR") {
    await prisma.warga.update({
      where: { id: wargaId },
      data: {
        statusAktif: false,
        kategoriTidakAktif: jenisMutasi === "MENINGGAL" ? "Meninggal" : "Pindah Keluar",
      },
    });
  }

  revalidatePath("/mutasi");
  revalidatePath("/warga");
  redirect("/mutasi");
}

export async function deleteMutasi(id: string) {
  await prisma.mutasiPenduduk.delete({ where: { id } });
  revalidatePath("/mutasi");
}
