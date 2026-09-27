"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { KondisiAset } from "@prisma/client";

export async function createKategoriAset(formData: FormData) {
  const nama = formData.get("nama") as string;
  if (!nama) throw new Error("Nama kategori aset wajib diisi.");

  const existing = await prisma.kategoriAset.findUnique({ where: { nama } });
  if (existing) throw new Error("Kategori aset sudah ada.");

  await prisma.kategoriAset.create({
    data: { nama },
  });

  revalidatePath("/inventaris");
}

export async function createAset(formData: FormData) {
  const kode = (formData.get("kode") as string).toUpperCase();
  const nama = formData.get("nama") as string;
  const kategoriId = formData.get("kategoriId") as string;
  const jumlah = parseInt((formData.get("jumlah") as string) || "1");
  const kondisi = (formData.get("kondisi") || "BAIK") as KondisiAset;
  const tanggalPerolehanStr = (formData.get("tanggalPerolehan") as string) || null;
  const nilaiPerolehan = parseFloat((formData.get("nilaiPerolehan") as string) || "0");
  const lokasiPenyimpanan = (formData.get("lokasiPenyimpanan") as string) || null;
  const keterangan = (formData.get("keterangan") as string) || null;
  const fotoUrl = (formData.get("fotoUrl") as string) || null;

  if (!kode || !nama || !kategoriId) {
    throw new Error("Kode, nama, dan kategori aset wajib diisi.");
  }

  const existing = await prisma.aset.findUnique({ where: { kode } });
  if (existing) throw new Error("Kode aset sudah digunakan.");

  await prisma.aset.create({
    data: {
      kode,
      nama,
      kategoriId,
      jumlah: isNaN(jumlah) ? 1 : jumlah,
      kondisi,
      tanggalPerolehan: tanggalPerolehanStr ? new Date(tanggalPerolehanStr) : null,
      nilaiPerolehan: isNaN(nilaiPerolehan) ? 0 : nilaiPerolehan,
      lokasiPenyimpanan,
      keterangan,
      fotoUrl,
    },
  });

  revalidatePath("/inventaris");
  redirect("/inventaris");
}

export async function deleteAset(id: string) {
  await prisma.aset.delete({ where: { id } });
  revalidatePath("/inventaris");
}
