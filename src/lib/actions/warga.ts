"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { JenisKelamin, Agama, Kewarganegaraan } from "@prisma/client";

export async function createWarga(formData: FormData) {
  const nik = formData.get("nik") as string;
  const namaLengkap = formData.get("namaLengkap") as string;
  const jenisKelamin = (formData.get("jenisKelamin") || "L") as JenisKelamin;
  const tempatLahir = (formData.get("tempatLahir") as string) || null;
  const tanggalLahirStr = formData.get("tanggalLahir") as string;
  const agama = (formData.get("agama") || "ISLAM") as Agama;
  const jenisPekerjaanId = (formData.get("jenisPekerjaanId") as string) || null;
  const kewarganegaraan = (formData.get("kewarganegaraan") || "WNI") as Kewarganegaraan;
  const namaAyah = (formData.get("namaAyah") as string) || null;
  const namaIbu = (formData.get("namaIbu") as string) || null;
  const alamat = (formData.get("alamat") as string) || null;

  if (!nik || !namaLengkap) {
    throw new Error("NIK dan Nama Lengkap wajib diisi.");
  }

  const existingUser = await prisma.user.findUnique({ where: { nik } });
  if (existingUser) {
    throw new Error("NIK sudah terdaftar.");
  }

  const hashedPassword = await hash("warga123", 10);
  const tanggalLahir = tanggalLahirStr ? new Date(tanggalLahirStr) : null;

  await prisma.user.create({
    data: {
      nik,
      password: hashedPassword,
      namaLengkap,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      agama,
      role: "WARGA",
      warga: {
        create: {
          jenisPekerjaanId: jenisPekerjaanId || undefined,
          kewarganegaraan,
          namaAyah,
          namaIbu,
          alamat,
        },
      },
    },
  });

  revalidatePath("/warga");
  redirect("/warga");
}

export async function updateWarga(id: string, formData: FormData) {
  const namaLengkap = formData.get("namaLengkap") as string;
  const jenisKelamin = (formData.get("jenisKelamin") || "L") as JenisKelamin;
  const tempatLahir = (formData.get("tempatLahir") as string) || null;
  const tanggalLahirStr = formData.get("tanggalLahir") as string;
  const agama = (formData.get("agama") || "ISLAM") as Agama;
  const jenisPekerjaanId = (formData.get("jenisPekerjaanId") as string) || null;
  const kewarganegaraan = (formData.get("kewarganegaraan") || "WNI") as Kewarganegaraan;
  const namaAyah = (formData.get("namaAyah") as string) || null;
  const namaIbu = (formData.get("namaIbu") as string) || null;
  const alamat = (formData.get("alamat") as string) || null;

  const warga = await prisma.warga.findUnique({ where: { id } });
  if (!warga) throw new Error("Warga tidak ditemukan.");

  const tanggalLahir = tanggalLahirStr ? new Date(tanggalLahirStr) : null;

  await prisma.user.update({
    where: { id: warga.userId },
    data: {
      namaLengkap,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      agama,
    },
  });

  await prisma.warga.update({
    where: { id },
    data: {
      jenisPekerjaanId: jenisPekerjaanId || null,
      kewarganegaraan,
      namaAyah,
      namaIbu,
      alamat,
    },
  });

  revalidatePath("/warga");
  revalidatePath(`/warga/${id}`);
  redirect("/warga");
}

export async function deleteWarga(id: string) {
  const warga = await prisma.warga.findUnique({ where: { id } });
  if (!warga) return;

  await prisma.warga.delete({ where: { id } });
  await prisma.user.delete({ where: { id: warga.userId } });

  revalidatePath("/warga");
}

export async function toggleStatusWarga(id: string) {
  const warga = await prisma.warga.findUnique({ where: { id } });
  if (!warga) return;

  await prisma.warga.update({
    where: { id },
    data: { statusAktif: !warga.statusAktif },
  });

  revalidatePath("/warga");
}
