"use server";

import { prisma } from "@/lib/prisma";
import { assignedRtId, requireRtStaff, wargaScopeWhere } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { passwordError } from "@/lib/password";
import { wargaSchema, wargaUpdateSchema } from "@/lib/validators/warga";

export async function createWarga(formData: FormData) {
  const access = await requireRtStaff();
  const value = (name: string) => formData.get(name)?.toString() || undefined;
  const parsed = wargaSchema.safeParse({
    nik: value("nik"),
    namaLengkap: value("namaLengkap"),
    jenisKelamin: value("jenisKelamin") || "L",
    tempatLahir: value("tempatLahir"),
    tanggalLahir: value("tanggalLahir"),
    agama: value("agama") || "ISLAM",
    jenisPekerjaanId: value("jenisPekerjaanId"),
    kewarganegaraan: value("kewarganegaraan") || "WNI",
    namaAyah: value("namaAyah"),
    namaIbu: value("namaIbu"),
    alamat: value("alamat"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Data warga tidak valid.");

  const { nik, namaLengkap, jenisKelamin, tempatLahir, tanggalLahir: tanggalLahirStr, agama, jenisPekerjaanId, kewarganegaraan, namaAyah, namaIbu, alamat } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { nik } });
  if (existingUser) {
    throw new Error("NIK sudah terdaftar.");
  }

  const passwordAwal = formData.get("passwordAwal")?.toString() || "";
  const error = passwordError(passwordAwal);
  if (error) throw new Error(error);
  if (passwordAwal !== formData.get("konfirmasiPassword")?.toString()) {
    throw new Error("Konfirmasi password tidak cocok.");
  }
  const hashedPassword = await hash(passwordAwal, 10);
  const tanggalLahir = tanggalLahirStr ? new Date(tanggalLahirStr) : null;
  const wilayahRtId = assignedRtId(access, value("wilayahRtId"));

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
          wilayahRtId,
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
  const access = await requireRtStaff();
  const value = (name: string) => formData.get(name)?.toString() || undefined;
  const parsed = wargaUpdateSchema.safeParse({
    namaLengkap: value("namaLengkap"),
    jenisKelamin: value("jenisKelamin") || "L",
    tempatLahir: value("tempatLahir"),
    tanggalLahir: value("tanggalLahir"),
    agama: value("agama") || "ISLAM",
    jenisPekerjaanId: value("jenisPekerjaanId"),
    kewarganegaraan: value("kewarganegaraan") || "WNI",
    namaAyah: value("namaAyah"),
    namaIbu: value("namaIbu"),
    alamat: value("alamat"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Data warga tidak valid.");

  const { namaLengkap, jenisKelamin, tempatLahir, tanggalLahir: tanggalLahirStr, agama, jenisPekerjaanId, kewarganegaraan, namaAyah, namaIbu, alamat } = parsed.data;

  const warga = await prisma.warga.findFirst({ where: { id, ...wargaScopeWhere(access) } });
  if (!warga) throw new Error("Warga tidak ditemukan atau berada di luar wilayah tugas.");

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
  const access = await requireRtStaff();
  const warga = await prisma.warga.findFirst({ where: { id, ...wargaScopeWhere(access) } });
  if (!warga) return;

  await prisma.$transaction([
    prisma.warga.delete({ where: { id } }),
    prisma.user.delete({ where: { id: warga.userId } }),
  ]);

  revalidatePath("/warga");
}

export async function toggleStatusWarga(id: string) {
  const access = await requireRtStaff();
  const warga = await prisma.warga.findFirst({ where: { id, ...wargaScopeWhere(access) } });
  if (!warga) return;

  await prisma.warga.update({
    where: { id },
    data: { statusAktif: !warga.statusAktif },
  });

  revalidatePath("/warga");
}
