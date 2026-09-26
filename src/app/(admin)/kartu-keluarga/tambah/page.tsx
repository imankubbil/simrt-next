import { prisma } from "@/lib/prisma";
import { createKartuKeluarga } from "@/lib/actions/kartu-keluarga";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TambahKKPage() {
  const wargaTersedia = await prisma.warga.findMany({
    where: { statusAktif: true, anggotaKK: null },
    include: { user: true },
    orderBy: { user: { namaLengkap: "asc" } },
  }).catch(() => []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/kartu-keluarga" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Kartu Keluarga Baru</h1>
          <p className="text-sm text-muted-foreground">Isi data KK dan tentukan Kepala Keluarga.</p>
        </div>
      </div>

      <form action={createKartuKeluarga} className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-1 text-sm">
            <label className="font-medium">Nomor Kartu Keluarga (16 Digit) <span className="text-red-500">*</span></label>
            <input
              name="nomorKK"
              type="text"
              maxLength={16}
              placeholder="3515000000000000"
              className="w-full p-2 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Pilih Kepala Keluarga <span className="text-red-500">*</span></label>
            <select name="kepalaWargaId" className="w-full p-2 border rounded-md text-sm bg-background" required>
              <option value="">-- Pilih Warga yang Belum Punya KK --</option>
              {wargaTersedia.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.user.namaLengkap} (NIK: {w.user.nik})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Hanya warga aktif yang belum terdaftar di KK lain yang tampil.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium">RT</label>
              <input name="rt" type="text" placeholder="003" className="w-full p-2 border rounded-md text-sm" />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">RW</label>
              <input name="rw" type="text" placeholder="002" className="w-full p-2 border rounded-md text-sm" />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">Kode Pos</label>
              <input name="kodePos" type="text" placeholder="60123" className="w-full p-2 border rounded-md text-sm" />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Alamat Lengkap <span className="text-red-500">*</span></label>
            <textarea
              name="alamat"
              rows={3}
              placeholder="Alamat rumah/domisili keluarga"
              className="w-full p-2 border rounded-md text-sm resize-none"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/kartu-keluarga" className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent">
            Batal
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            Simpan & Tambah Anggota
          </button>
        </div>
      </form>
    </div>
  );
}