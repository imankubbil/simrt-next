"use server";

import { prisma } from "@/lib/prisma";
import { assertWargaInScope, requireAdmin, requireRtStaff, rtScopeWhere } from "@/lib/auth";
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
  const access = await requireRtStaff();
  const parsed = suratSchema.safeParse({
    jenisSuratId: formData.get("jenisSuratId")?.toString(),
    wargaId: formData.get("wargaId")?.toString(),
    keperluan: formData.get("keperluan")?.toString(),
    tanggal: formData.get("tanggal")?.toString(),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Data surat tidak valid.");

  const { jenisSuratId, wargaId, keperluan, tanggal: tanggalStr } = parsed.data;
  const warga = await assertWargaInScope(access, wargaId);
  if (!warga.wilayahRtId) throw new Error("Warga belum memiliki RT.");

  const surat = await prisma.$transaction(async (tx) => {
    const jenisSurat = await tx.jenisSurat.findUnique({ where: { id: jenisSuratId } });
    if (!jenisSurat) throw new Error("Jenis surat tidak ditemukan.");

    const rt = await tx.wilayahRt.findUnique({ where: { id: warga.wilayahRtId! }, select: { nomor: true } });
    if (!rt) throw new Error("RT warga tidak ditemukan.");
    const updatedJenisSurat = await tx.jenisSurat.update({
      where: { id: jenisSuratId },
      data: { counter: { increment: 1 } },
    });
    const nomorSurat = generateNomorSurat(
      updatedJenisSurat.counter,
      jenisSurat.kodePrefix,
      rt.nomor,
    );

    return tx.surat.create({
      data: {
        nomorSurat,
        jenisSuratId,
        wargaId,
        wilayahRtId: warga.wilayahRtId,
        keperluan,
        tanggal: new Date(tanggalStr),
        status: StatusSurat.SELESAI,
        createdById: access.userId,
      },
    });
  });

  revalidatePath("/surat");
  redirect(`/surat/${surat.id}`);
}

export async function deleteSurat(id: string) {
  const access = await requireRtStaff();
  const result = await prisma.surat.deleteMany({ where: { id, wilayahRt: { is: rtScopeWhere(access) } } });
  if (!result.count) throw new Error("Surat tidak ditemukan atau berada di luar wilayah tugas.");
  revalidatePath("/surat");
  redirect("/surat");
}
