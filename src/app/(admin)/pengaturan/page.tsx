import Link from "next/link";
import { Settings, Save } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateKonfigurasiSistem } from "@/lib/actions/pengaturan";

export default async function PengaturanPage() {
  await requireAdmin();
  const sistem = await prisma.konfigurasiSistem.findUnique({ where: { id: "singleton" } }).catch(() => null);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <p className="mt-1 text-sm text-muted-foreground">Simpan identitas desa yang digunakan pada dokumen resmi.</p>
      </header>

      <Link href="/pengaturan/wilayah" className="inline-flex min-h-11 items-center rounded-md border bg-card px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        Kelola RW, RT, pengurus, dan tanda tangan
      </Link>

      <form action={updateKonfigurasiSistem} className="space-y-6 rounded-lg border bg-card p-5 md:p-6">
        <h2 className="flex items-center gap-2 border-b pb-4 text-lg font-semibold">
          <Settings className="h-5 w-5 text-primary" aria-hidden="true" /> Identitas Desa
        </h2>
        <p className="text-sm text-muted-foreground">Nomor RT/RW dan Ketua dikelola per wilayah, bukan lagi sebagai satu nilai global.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <label htmlFor="kabupaten" className="font-medium">Kabupaten / Kota</label>
            <input id="kabupaten" name="kabupaten" defaultValue={sistem?.kabupaten || ""} className="min-h-11 w-full rounded-md border bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="kecamatan" className="font-medium">Kecamatan</label>
            <input id="kecamatan" name="kecamatan" defaultValue={sistem?.kecamatan || ""} className="min-h-11 w-full rounded-md border bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="desa" className="font-medium">Desa / Kelurahan</label>
            <input id="desa" name="desa" defaultValue={sistem?.desa || ""} className="min-h-11 w-full rounded-md border bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="dusun" className="font-medium">Dusun / Lingkungan</label>
            <input id="dusun" name="dusun" defaultValue={sistem?.dusun || ""} className="min-h-11 w-full rounded-md border bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div className="space-y-1 text-sm sm:col-span-2">
            <label htmlFor="kodePos" className="font-medium">Kode Pos</label>
            <input id="kodePos" name="kodePos" defaultValue={sistem?.kodePos || ""} className="min-h-11 w-full rounded-md border bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
        </div>
        <div className="flex justify-end border-t pt-4">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <Save className="h-4 w-4" aria-hidden="true" /> Simpan identitas
          </button>
        </div>
      </form>
    </div>
  );
}
