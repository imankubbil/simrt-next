"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HubunganKeluarga } from "@prisma/client";

export async function createKartuKeluarga(formData: FormData) {
  const nomorKK = formData.get("nomorKK") as string;
  const alamat = formData.get("alamat") as string;
  const rt = (formData.get("rt") as string) || null;
  const rw = (formData.get("rw") as string) || null;
  const kodePos = (formData.get("kodePos") as string) || null;
  const kepalaWargaId = formData.get("kepalaWargaId") as string;

  if (!nomorKK || nomorKK.length !== 16) {
    throw new Error("Nomor KK wajib 16 digit.");
  }
  if (!alamat || !kepalaWargaId) {
    throw new Error("Alamat dan Kepala Keluarga wajib diisi.");
  }

  const existingKK = await prisma.kartuKeluarga.findUnique({ where: { nomorKK } });
  if (existingKK) throw new Error("Nomor KK sudah terdaftar.");

  const existingAnggota = await prisma.anggotaKeluarga.findUnique({ where: { wargaId: kepalaWargaId } });
  if (existingAnggota) throw new Error("Warga yang dipilih sudah terdaftar di KK lain.");

  const kk = await prisma.kartuKeluarga.create({
    data: {
      nomorKK,
      alamat,
      rt,
      rw,
      kodePos,
      anggota: {
        create: {
          wargaId: kepalaWargaId,
          hubungan: HubunganKeluarga.KEPALA_KELUARGA,
        },
      },
    },
  });

  revalidatePath("/kartu-keluarga");
  redirect(`/kartu-keluarga/${kk.id}`);
}

export async function updateKartuKeluarga(id: string, formData: FormData) {
  const nomorKK = formData.get("nomorKK") as string;
  const alamat = formData.get("alamat") as string;
  const rt = (formData.get("rt") as string) || null;
  const rw = (formData.get("rw") as string) || null;
  const kodePos = (formData.get("kodePos") as string) || null;

  if (!nomorKK || nomorKK.length !== 16) throw new Error("Nomor KK wajib 16 digit.");
  if (!alamat) throw new Error("Alamat wajib diisi.");

  await prisma.kartuKeluarga.update({
    where: { id },
    data: { nomorKK, alamat, rt, rw, kodePos },
  });

  revalidatePath("/kartu-keluarga");
  revalidatePath(`/kartu-keluarga/${id}`);
  redirect(`/kartu-keluarga/${id}`);
}

export async function deleteKartuKeluarga(id: string) {
  await prisma.anggotaKeluarga.deleteMany({ where: { kartuKeluargaId: id } });
  await prisma.kartuKeluarga.delete({ where: { id } });

  revalidatePath("/kartu-keluarga");
  redirect("/kartu-keluarga");
}

export async function addAnggotaKeluarga(formData: FormData) {
  const kartuKeluargaId = formData.get("kartuKeluargaId") as string;
  const wargaId = formData.get("wargaId") as string;
  const hubungan = formData.get("hubungan") as HubunganKeluarga;

  if (!kartuKeluargaId || !wargaId || !hubungan) {
    throw new Error("Data anggota tidak lengkap.");
  }

  const existing = await prisma.anggotaKeluarga.findUnique({ where: { wargaId } });
  if (existing) throw new Error("Warga sudah terdaftar di KK lain.");

  await prisma.anggotaKeluarga.create({
    data: { kartuKeluargaId, wargaId, hubungan },
  });

  revalidatePath(`/kartu-keluarga/${kartuKeluargaId}`);
}

export async function removeAnggotaKeluarga(anggotaId: string, kartuKeluargaId: string) {
  await prisma.anggotaKeluarga.delete({ where: { id: anggotaId } });
  revalidatePath(`/kartu-keluarga/${kartuKeluargaId}`);
}