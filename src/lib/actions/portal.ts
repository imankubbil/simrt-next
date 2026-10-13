"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateNomorSurat } from "@/lib/utils";
import { StatusSurat } from "@prisma/client";
import { pengajuanSuratSchema } from "@/lib/validators/warga";

export async function ajukanSuratWarga(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "WARGA") throw new Error("Anda harus login sebagai warga terlebih dahulu.");

  const parsed = pengajuanSuratSchema.safeParse({
    jenisSuratId: formData.get("jenisSuratId")?.toString(),
    keperluan: formData.get("keperluan")?.toString(),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Pengajuan surat tidak valid.");

  const { jenisSuratId, keperluan } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { warga: true },
  });

  if (!user || !user.warga) {
    throw new Error("Data Warga tidak ditemukan.");
  }
  const wargaId = user.warga.id;

  await prisma.$transaction(async (tx) => {
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

    await tx.surat.create({
      data: {
        nomorSurat,
        jenisSuratId,
        wargaId,
        keperluan,
        tanggal: new Date(),
        status: StatusSurat.DIAJUKAN,
        createdById: user.id,
      },
    });
  });

  revalidatePath("/portal/surat");
  redirect("/portal/surat");
}
