import { createJenisIuran } from "@/lib/actions/iuran";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TambahJenisIuranPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/iuran" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Jenis Iuran</h1>
          <p className="text-sm text-muted-foreground">Buat kategori/jenis iuran warga baru.</p>
        </div>
      </div>

      <form action={createJenisIuran} className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-1 text-sm">
            <label className="font-medium">Nama Iuran <span className="text-red-500">*</span></label>
            <input
              name="nama"
              type="text"
              placeholder="Contoh: Iuran Kebersihan & Keamanan"
              className="w-full p-2 border rounded-md text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Nominal Standar (Rp) <span className="text-red-500">*</span></label>
              <input
                name="nominal"
                type="number"
                placeholder="50000"
                className="w-full p-2 border rounded-md text-sm font-mono"
                required
              />
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium">Periode</label>
              <select name="periode" className="w-full p-2 border rounded-md text-sm bg-background">
                <option value="BULANAN">Bulanan</option>
                <option value="TAHUNAN">Tahunan</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Keterangan</label>
            <input
              name="keterangan"
              type="text"
              placeholder="Penjelasan singkat mengenai iuran ini"
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/iuran" className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent">
            Batal
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            Simpan Jenis Iuran
          </button>
        </div>
      </form>
    </div>
  );
}