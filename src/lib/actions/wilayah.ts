"use server";

import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageRwSettings, requireAdmin, requireStaff } from "@/lib/auth";
import { passwordError } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { bacaTandaTangan } from "@/lib/signature";

const text = (formData: FormData, key: string) => formData.get(key)?.toString().trim() || "";
type PengurusRole = Extract<Role, "PENGURUS_RW" | "PENGURUS_RT">;

function selectedTerritory(formData: FormData) {
  const [kind, id] = text(formData, "wilayah").split(":");
  const role: PengurusRole | null = kind === "RW" ? "PENGURUS_RW" : kind === "RT" ? "PENGURUS_RT" : null;
  if (!role || !id) throw new Error("Wilayah penugasan wajib dipilih.");
  return { role, id };
}

async function checkAssignment(role: "PENGURUS_RW" | "PENGURUS_RT", regionId: string) {
  const region = role === "PENGURUS_RW"
    ? await prisma.wilayahRw.findUnique({ where: { id: regionId }, select: { id: true } })
    : await prisma.wilayahRt.findUnique({ where: { id: regionId }, select: { id: true } });
  if (!region) throw new Error("Wilayah tidak ditemukan.");
}

export async function simpanWilayahRw(formData: FormData) {
  await requireAdmin();
  const nomor = text(formData, "nomor");
  if (!nomor || nomor.length > 20) throw new Error("Nomor RW wajib diisi (maksimal 20 karakter).");
  await prisma.wilayahRw.upsert({ where: { nomor }, update: {}, create: { nomor } });
  revalidatePath("/pengaturan/wilayah");
  redirect("/pengaturan/wilayah?tersimpan=1");
}

export async function simpanWilayahRt(formData: FormData) {
  await requireAdmin();
  const nomor = text(formData, "nomor");
  const rwId = text(formData, "rwId");
  if (!nomor || nomor.length > 20 || !rwId) throw new Error("Nomor RT dan RW wajib diisi.");
  await prisma.wilayahRt.upsert({
    where: { rwId_nomor: { rwId, nomor } },
    update: {},
    create: { rwId, nomor },
  });
  revalidatePath("/pengaturan/wilayah");
  redirect("/pengaturan/wilayah?tersimpan=1");
}

export async function buatAkunPengurus(formData: FormData) {
  const access = await requireStaff();
  const { role, id: wilayahId } = selectedTerritory(formData);
  const nik = text(formData, "nik");
  const namaLengkap = text(formData, "namaLengkap");
  const password = formData.get("password")?.toString() || "";
  if (!/^\d{16}$/.test(nik) || !namaLengkap) throw new Error("NIK harus 16 digit dan nama wajib diisi.");
  const error = passwordError(password);
  if (error) throw new Error(error);
  await checkAssignment(role, wilayahId);
  if (access.role === "PENGURUS_RW") {
    const rt = role === "PENGURUS_RT" ? await prisma.wilayahRt.findUnique({ where: { id: wilayahId }, select: { rwId: true } }) : null;
    if (!rt || rt.rwId !== access.wilayahRwId) throw new Error("Pengurus RW hanya dapat membuat akun pengurus RT di RW tugasnya.");
  } else if (access.role !== "ADMIN") {
    throw new Error("Hanya Admin atau Pengurus RW yang dapat membuat akun pengurus.");
  }
  if (await prisma.user.findUnique({ where: { nik }, select: { id: true } })) throw new Error("NIK sudah digunakan.");

  const hashedPassword = await hash(password, 10);
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        nik,
        namaLengkap,
        password: hashedPassword,
        role,
        ...(role === "PENGURUS_RW" ? { wilayahRwId: wilayahId } : { wilayahRtId: wilayahId }),
      },
    });
    if (formData.get("ketua") === "on") {
      if (role === "PENGURUS_RW") await tx.wilayahRw.update({ where: { id: wilayahId }, data: { ketuaRwId: user.id } });
      else await tx.wilayahRt.update({ where: { id: wilayahId }, data: { ketuaRtId: user.id } });
    }
  });
  revalidatePath("/pengaturan/wilayah");
  redirect("/pengaturan/wilayah?tersimpan=1");
}

export async function ubahPenugasanPengurus(userId: string, formData: FormData) {
  const access = await requireStaff();
  const { role, id: wilayahId } = selectedTerritory(formData);
  await checkAssignment(role, wilayahId);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, wilayahRtId: true } });
  if (!user || (user.role !== "PENGURUS_RW" && user.role !== "PENGURUS_RT")) throw new Error("Akun pengurus tidak ditemukan.");
  if (access.role === "PENGURUS_RW") {
    const [currentRt, targetRt] = await Promise.all([
      user.wilayahRtId ? prisma.wilayahRt.findUnique({ where: { id: user.wilayahRtId }, select: { rwId: true } }) : null,
      role === "PENGURUS_RT" ? prisma.wilayahRt.findUnique({ where: { id: wilayahId }, select: { rwId: true } }) : null,
    ]);
    if (user.role !== "PENGURUS_RT" || currentRt?.rwId !== access.wilayahRwId || targetRt?.rwId !== access.wilayahRwId) {
      throw new Error("Pengurus RW hanya dapat mengubah penugasan pengurus RT di RW tugasnya.");
    }
  } else if (access.role !== "ADMIN") {
    throw new Error("Akses mengubah penugasan tidak diizinkan.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        role,
        wilayahRwId: role === "PENGURUS_RW" ? wilayahId : null,
        wilayahRtId: role === "PENGURUS_RT" ? wilayahId : null,
      },
    });
    await Promise.all([
      tx.wilayahRw.updateMany({ where: { ketuaRwId: userId }, data: { ketuaRwId: null } }),
      tx.wilayahRt.updateMany({ where: { ketuaRtId: userId }, data: { ketuaRtId: null } }),
    ]);
    if (formData.get("ketua") === "on") {
      if (role === "PENGURUS_RW") await tx.wilayahRw.update({ where: { id: wilayahId }, data: { ketuaRwId: userId } });
      else await tx.wilayahRt.update({ where: { id: wilayahId }, data: { ketuaRtId: userId } });
    }
  });
  revalidatePath("/pengaturan/wilayah");
  redirect("/pengaturan/wilayah?tersimpan=1");
}

export async function simpanTtdRw(id: string, formData: FormData) {
  const access = await requireStaff();
  if (access.role !== "ADMIN") {
    const rw = await prisma.wilayahRw.findUnique({ where: { id }, select: { ketuaRwId: true } });
    if (!rw || !canManageRwSettings(access, id, rw.ketuaRwId)) {
      throw new Error("Hanya Ketua RW yang ditetapkan yang dapat mengatur tanda tangan RW ini.");
    }
  }
  const tandaTangan = await bacaTandaTangan(formData, "ttd", "hapusTtd");
  if (tandaTangan === undefined) throw new Error("Pilih gambar tanda tangan atau centang opsi hapus.");
  await prisma.wilayahRw.update({ where: { id }, data: { ttdKetuaRw: tandaTangan } });
  revalidatePath("/pengaturan/wilayah");
  revalidatePath("/surat");
  redirect("/pengaturan/wilayah?tersimpan=1");
}

export async function simpanTtdRt(id: string, formData: FormData) {
  await requireAdmin();
  const tandaTangan = await bacaTandaTangan(formData, "ttd", "hapusTtd");
  if (tandaTangan === undefined) throw new Error("Pilih gambar tanda tangan atau centang opsi hapus.");
  await prisma.wilayahRt.update({ where: { id }, data: { ttdKetuaRt: tandaTangan } });
  revalidatePath("/pengaturan/wilayah");
  revalidatePath("/surat");
  redirect("/pengaturan/wilayah?tersimpan=1");
}
