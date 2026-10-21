"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateKonfigurasiSistem(formData: FormData) {
  await requireAdmin();
  const kabupaten = (formData.get("kabupaten") as string) || null;
  const kecamatan = (formData.get("kecamatan") as string) || null;
  const desa = (formData.get("desa") as string) || null;
  const dusun = (formData.get("dusun") as string) || null;
  const kodePos = (formData.get("kodePos") as string) || null;
  await prisma.konfigurasiSistem.upsert({
    where: { id: "singleton" },
    update: { kabupaten, kecamatan, desa, dusun, kodePos },
    create: { id: "singleton", kabupaten, kecamatan, desa, dusun, kodePos },
  });

  revalidatePath("/pengaturan");
}
