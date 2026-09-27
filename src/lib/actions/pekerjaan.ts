"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createJenisPekerjaan(formData: FormData) {
  const nama = formData.get("nama") as string;
  const keterangan = (formData.get("keterangan") as string) || null;

  if (!nama) throw new Error("Nama pekerjaan wajib diisi.");

  const existing = await prisma.jenisPekerjaan.findUnique({ where: { nama } });
  if (existing) throw new Error("Nama pekerjaan sudah ada.");

  await prisma.jenisPekerjaan.create({
    data: { nama, keterangan },
  });

  revalidatePath("/warga/pekerjaan");
  revalidatePath("/warga/tambah");
}

export async function deleteJenisPekerjaan(id: string) {
  await prisma.jenisPekerjaan.delete({ where: { id } });
  revalidatePath("/warga/pekerjaan");
  revalidatePath("/warga/tambah");
}
