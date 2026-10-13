"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { bacaTandaTangan } from "@/lib/signature";

export async function updateKonfigurasiSistem(formData: FormData) {
  await requireAdmin();
  const kabupaten = (formData.get("kabupaten") as string) || null;
  const kecamatan = (formData.get("kecamatan") as string) || null;
  const desa = (formData.get("desa") as string) || null;
  const dusun = (formData.get("dusun") as string) || null;
  const kodePos = (formData.get("kodePos") as string) || null;
  const rt = (formData.get("rt") as string) || null;
  const rw = (formData.get("rw") as string) || null;
  const ketuaRtId = (formData.get("ketuaRtId") as string) || null;
  const ketuaRwId = (formData.get("ketuaRwId") as string) || null;
  const [ttdKetuaRt, ttdKetuaRw] = await Promise.all([
    bacaTandaTangan(formData, "ttdKetuaRt", "hapusTtdKetuaRt"),
    bacaTandaTangan(formData, "ttdKetuaRw", "hapusTtdKetuaRw"),
  ]);

  await prisma.konfigurasiSistem.upsert({
    where: { id: "singleton" },
    update: { kabupaten, kecamatan, desa, dusun, kodePos, rt, rw, ketuaRtId, ketuaRwId, ...(ttdKetuaRt !== undefined && { ttdKetuaRt }), ...(ttdKetuaRw !== undefined && { ttdKetuaRw }) },
    create: { id: "singleton", kabupaten, kecamatan, desa, dusun, kodePos, rt, rw, ketuaRtId, ketuaRwId, ttdKetuaRt: ttdKetuaRt || null, ttdKetuaRw: ttdKetuaRw || null },
  });

  revalidatePath("/pengaturan");
}
