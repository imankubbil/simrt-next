"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateNomorSurat } from "@/lib/utils";
import { StatusSurat } from "@prisma/client";

export async function ajukanSuratWarga(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Anda harus login terlebih dahulu.");

  const jenisSuratId = formData.get("jenisSuratId") as string;
  const keperluan = formData.get("keperluan") as string;

  if (!jenisSuratId || !keperluan) {
    throw new Error("Jenis surat dan keperluan wajib diisi.");
  }

  const user = await prisma.user.findUnique({
    where: { nik: session.user.email || "" },
    include: { warga: true },
  });

  if (!user || !user.warga) {
    throw new Error("Data Warga tidak ditemukan.");
  }

  const jenisSurat = await prisma.jenisSurat.findUnique({ where: { id: jenisSuratId } });
  if (!jenisSurat) throw new Error("Jenis surat tidak ditemukan.");

  const sistem = await prisma.konfigurasiSistem.findUnique({ where: { id: "singleton" } });
  const newCounter = jenisSurat.counter + 1;
  const nomorSurat = generateNomorSurat(newCounter, jenisSurat.kodePrefix, sistem?.rt || "000");

  await prisma.jenisSurat.update({
    where: { id: jenisSuratId },
    data: { counter: newCounter },
  });

  await prisma.surat.create({
    data: {
      nomorSurat,
      jenisSuratId,
      wargaId: user.warga.id,
      keperluan,
      tanggal: new Date(),
      status: StatusSurat.DIAJUKAN,
      createdById: user.id,
    },
  });

  revalidatePath("/portal/surat");
  redirect("/portal/surat");
}
