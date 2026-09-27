"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateKonfigurasiSistem(formData: FormData) {
  const kabupaten = (formData.get("kabupaten") as string) || null;
  const kecamatan = (formData.get("kecamatan") as string) || null;
  const desa = (formData.get("desa") as string) || null;
  const dusun = (formData.get("dusun") as string) || null;
  const kodePos = (formData.get("kodePos") as string) || null;
  const rt = (formData.get("rt") as string) || null;
  const rw = (formData.get("rw") as string) || null;
  const ketuaRtId = (formData.get("ketuaRtId") as string) || null;
  const ketuaRwId = (formData.get("ketuaRwId") as string) || null;

  await prisma.konfigurasiSistem.upsert({
    where: { id: "singleton" },
    update: { kabupaten, kecamatan, desa, dusun, kodePos, rt, rw, ketuaRtId, ketuaRwId },
    create: { id: "singleton", kabupaten, kecamatan, desa, dusun, kodePos, rt, rw, ketuaRtId, ketuaRwId },
  });

  revalidatePath("/pengaturan");
}
