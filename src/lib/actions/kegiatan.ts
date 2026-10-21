"use server";

import { prisma } from "@/lib/prisma";
import { assignedRtId, requireAdmin, requireRtStaff, rtScopeWhere } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Berulang } from "@prisma/client";

export async function createJenisKegiatan(formData: FormData) {
  await requireAdmin();
  const nama = formData.get("nama") as string;
  const warna = (formData.get("warna") as string) || "#3498db";

  if (!nama) throw new Error("Nama jenis kegiatan wajib diisi.");

  await prisma.jenisKegiatan.create({
    data: { nama, warna },
  });

  revalidatePath("/kegiatan");
}

export async function createKegiatan(formData: FormData) {
  const access = await requireRtStaff();
  const judul = formData.get("judul") as string;
  const jenisId = formData.get("jenisId") as string;
  const deskripsi = (formData.get("deskripsi") as string) || null;
  const tanggalMulaiStr = formData.get("tanggalMulai") as string;
  const tanggalSelesaiStr = (formData.get("tanggalSelesai") as string) || null;
  const lokasi = (formData.get("lokasi") as string) || null;
  const berulang = (formData.get("berulang") || "TIDAK") as Berulang;
  const catatanHasil = (formData.get("catatanHasil") as string) || null;

  if (!judul || !jenisId || !tanggalMulaiStr) {
    throw new Error("Judul, jenis kegiatan, dan tanggal mulai wajib diisi.");
  }

  await prisma.kegiatan.create({
    data: {
      judul,
      jenisId,
      deskripsi,
      tanggalMulai: new Date(tanggalMulaiStr),
      tanggalSelesai: tanggalSelesaiStr ? new Date(tanggalSelesaiStr) : null,
      lokasi,
      berulang,
      catatanHasil,
      createdById: access.userId,
      wilayahRtId: assignedRtId(access, formData.get("wilayahRtId")?.toString()),
    },
  });

  revalidatePath("/kegiatan");
  redirect("/kegiatan");
}

export async function deleteKegiatan(id: string) {
  const access = await requireRtStaff();
  const result = await prisma.kegiatan.deleteMany({ where: { id, wilayahRt: { is: rtScopeWhere(access) } } });
  if (!result.count) throw new Error("Kegiatan tidak ditemukan atau berada di luar wilayah tugas.");
  revalidatePath("/kegiatan");
}
