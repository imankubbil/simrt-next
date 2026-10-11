"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateNomorSurat } from "@/lib/utils";
import { StatusSurat } from "@prisma/client";
import { suratSchema } from "@/lib/validators/warga";

export async function createJenisSurat(formData: FormData) {
  await requireAdmin();
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
  const session = await requireAdmin();
  const parsed = suratSchema.safeParse({
    jenisSuratId: formData.get("jenisSuratId")?.toString(),
    wargaId: formData.get("wargaId")?.toString(),
    keperluan: formData.get("keperluan")?.toString(),
    tanggal: formData.get("tanggal")?.toString(),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Data surat tidak valid.");

  const { jenisSuratId, wargaId, keperluan, tanggal: tanggalStr } = parsed.data;

  const surat = await prisma.$transaction(async (tx) => {
    const jenisSurat = await tx.jenisSurat.findUnique({ where: { id: jenisSuratId } });
    if (!jenisSurat) throw new Error("Jenis surat tidak ditemukan.");

    const sistem = await tx.konfigurasiSistem.findUnique({ where: { id: "singleton" } });
    const updatedJenisSurat = await tx.jenisSurat.update({
      where: { id: jenisSuratId },
      data: { counter: { increment: 1 } },
    });
    const nomorSurat = generateNomorSurat(
      updatedJenisSurat.counter,
      jenisSurat.kodePrefix,
      sistem?.rt || "000",
    );

    return tx.surat.create({
      data: {
        nomorSurat,
        jenisSuratId,
        wargaId,
        keperluan,
        tanggal: new Date(tanggalStr),
        status: StatusSurat.SELESAI,
        createdById: session.user.id,
      },
    });
  });

  revalidatePath("/surat");
  redirect(`/surat/${surat.id}`);
}

export async function deleteSurat(id: string) {
  await requireAdmin();
  await prisma.surat.delete({ where: { id } });
  revalidatePath("/surat");
  redirect("/surat");
}
