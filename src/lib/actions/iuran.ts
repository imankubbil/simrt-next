"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PeriodeIuran } from "@prisma/client";
import { iuranSchema } from "@/lib/validators/warga";

export async function createJenisIuran(formData: FormData) {
  await requireAdmin();
  const nama = formData.get("nama") as string;
  const nominal = parseFloat(formData.get("nominal") as string);
  const periode = (formData.get("periode") || "BULANAN") as PeriodeIuran;
  const keterangan = (formData.get("keterangan") as string) || null;

  if (!nama || isNaN(nominal) || nominal <= 0) {
    throw new Error("Nama dan nominal iuran wajib diisi dengan benar.");
  }

  await prisma.jenisIuran.create({
    data: { nama, nominal, periode, keterangan },
  });

  revalidatePath("/iuran");
  redirect("/iuran");
}

export async function catatPembayaranIuran(formData: FormData) {
  const session = await requireAdmin();
  const parsed = iuranSchema.safeParse({
    wargaId: formData.get("wargaId")?.toString(),
    jenisIuranId: formData.get("jenisIuranId")?.toString(),
    bulan: formData.get("bulan")?.toString(),
    tahun: formData.get("tahun")?.toString(),
    nominalBayar: formData.get("nominalBayar")?.toString(),
    tanggalBayar: formData.get("tanggalBayar")?.toString(),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Data pembayaran tidak valid.");

  const { wargaId, jenisIuranId, bulan, tahun, nominalBayar, tanggalBayar: tanggalBayarStr } = parsed.data;
  const keterangan = formData.get("keterangan")?.toString() || null;

  const existing = await prisma.pembayaranIuran.findUnique({
    where: {
      wargaId_jenisIuranId_bulan_tahun: { wargaId, jenisIuranId, bulan, tahun },
    },
  });

  if (existing) {
    throw new Error(`Warga tersebut sudah membayar iuran periode ${bulan}/${tahun}.`);
  }

  await prisma.pembayaranIuran.create({
    data: {
      wargaId,
      jenisIuranId,
      bulan,
      tahun,
      nominalBayar,
      tanggalBayar: new Date(tanggalBayarStr),
      keterangan,
      createdById: session.user.id,
    },
  });

  revalidatePath("/iuran");
  redirect("/iuran");
}

export async function deletePembayaranIuran(id: string) {
  await requireAdmin();
  await prisma.pembayaranIuran.delete({ where: { id } });
  revalidatePath("/iuran");
}
