"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateNomorSurat } from "@/lib/utils";
import { StatusSurat } from "@prisma/client";

export async function createJenisSurat(formData: FormData) {
  const nama = formData.get("nama") as string;
  const kodePrefix = (formData.get("kodePrefix") as string).toUpperCase();
  const templateHtml = formData.get("templateHtml") as string;

  if (!nama || !kodePrefix || !templateHtml) {
    throw new Error("Semua field jenis surat wajib diisi.");
  }

  const existing = await prisma.jenisSurat.findUnique({ where: { kodePrefix } });
  if (existing) throw new Error("Kode Prefix sudah digunakan.");

  await prisma.jenisSurat.create({
    data: { nama, kodePrefix, templateHtml },
  });

  revalidatePath("/surat");
  redirect("/surat");
}

export async function createSurat(formData: FormData) {
  const jenisSuratId = formData.get("jenisSuratId") as string;
  const wargaId = formData.get("wargaId") as string;
  const keperluan = formData.get("keperluan") as string;
  const tanggalStr = formData.get("tanggal") as string;

  if (!jenisSuratId || !wargaId || !keperluan || !tanggalStr) {
    throw new Error("Semua field surat wajib diisi.");
  }

  const jenisSurat = await prisma.jenisSurat.findUnique({ where: { id: jenisSuratId } });
  if (!jenisSurat) throw new Error("Jenis surat tidak ditemukan.");

  const sistem = await prisma.konfigurasiSistem.findUnique({ where: { id: "singleton" } });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("User Admin tidak ditemukan.");

  const newCounter = jenisSurat.counter + 1;
  const nomorSurat = generateNomorSurat(newCounter, jenisSurat.kodePrefix, sistem?.rt || "000");

  // Update counter
  await prisma.jenisSurat.update({
    where: { id: jenisSuratId },
    data: { counter: newCounter },
  });

  const surat = await prisma.surat.create({
    data: {
      nomorSurat,
      jenisSuratId,
      wargaId,
      keperluan,
      tanggal: new Date(tanggalStr),
      status: StatusSurat.SELESAI,
      createdById: admin.id,
    },
  });

  revalidatePath("/surat");
  redirect(`/surat/${surat.id}`);
}

export async function deleteSurat(id: string) {
  await prisma.surat.delete({ where: { id } });
  revalidatePath("/surat");
  redirect("/surat");
}