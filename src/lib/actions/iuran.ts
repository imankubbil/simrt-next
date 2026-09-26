"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PeriodeIuran } from "@prisma/client";

export async function createJenisIuran(formData: FormData) {
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
  const wargaId = formData.get("wargaId") as string;
  const jenisIuranId = formData.get("jenisIuranId") as string;
  const bulan = parseInt(formData.get("bulan") as string);
  const tahun = parseInt(formData.get("tahun") as string);
  const nominalBayar = parseFloat(formData.get("nominalBayar") as string);
  const tanggalBayarStr = formData.get("tanggalBayar") as string;
  const keterangan = (formData.get("keterangan") as string) || null;

  if (!wargaId || !jenisIuranId || !bulan || !tahun || isNaN(nominalBayar) || !tanggalBayarStr) {
    throw new Error("Data pembayaran tidak lengkap.");
  }

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("User Admin tidak ditemukan.");

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
      createdById: admin.id,
    },
  });

  revalidatePath("/iuran");
  redirect("/iuran");
}

export async function deletePembayaranIuran(id: string) {
  await prisma.pembayaranIuran.delete({ where: { id } });
  revalidatePath("/iuran");
}