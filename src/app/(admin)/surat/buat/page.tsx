import { prisma } from "@/lib/prisma";
import { createSurat } from "@/lib/actions/surat";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BuatSuratPage() {
  const jenisSuratList = await prisma.jenisSurat.findMany({
    where: { aktif: true },
    orderBy: { nama: "asc" },
  }).catch(() => []);

  const wargaList = await prisma.warga.findMany({
    where: { statusAktif: true },
    include: { user: true },
    orderBy: { user: { namaLengkap: "asc" } },
  }).catch(() => []);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/surat" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buat Surat Baru</h1>
          <p className="text-sm text-muted-foreground">Terbitkan Surat Keterangan / Pengantar untuk warga.</p>
        </div>
      </div>

      <form action={createSurat} className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-1 text-sm">
            <label className="font-medium">Pilih Jenis Surat <span className="text-red-500">*</span></label>
            <select name="jenisSuratId" className="w-full p-2 border rounded-md text-sm bg-background" required>
              <option value="">-- Pilih Jenis Surat --</option>
              {jenisSuratList.map((j) => (
                <option key={j.id} value={j.id}>
                  [{j.kodePrefix}] {j.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Pilih Warga (Pemohon) <span className="text-red-500">*</span></label>
            <select name="wargaId" className="w-full p-2 border rounded-md text-sm bg-background" required>
              <option value="">-- Pilih Warga --</option>
              {wargaList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.user.namaLengkap} (NIK: {w.user.nik})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Tanggal Surat <span className="text-red-500">*</span></label>
            <input
              name="tanggal"
              type="date"
              defaultValue={todayStr}
              className="w-full p-2 border rounded-md text-sm bg-background"
              required
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Keperluan / Keterangan <span className="text-red-500">*</span></label>
            <textarea
              name="keperluan"
              rows={4}
              placeholder="Contoh: Mengurus KTP baru, Persyaratan Beasiswa, dll."
              className="w-full p-2 border rounded-md text-sm resize-none"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/surat" className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent">
            Batal
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            Terbitkan & Cetak
          </button>
        </div>
      </form>
    </div>
  );
}