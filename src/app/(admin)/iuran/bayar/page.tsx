import { prisma } from "@/lib/prisma";
import { catatPembayaranIuran } from "@/lib/actions/iuran";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CatatIuranPage() {
  const jenisIuranList = await prisma.jenisIuran.findMany({
    where: { aktif: true },
    orderBy: { nama: "asc" },
  }).catch(() => []);

  const wargaList = await prisma.warga.findMany({
    where: { statusAktif: true },
    include: { user: true },
    orderBy: { user: { namaLengkap: "asc" } },
  }).catch(() => []);

  const now = new Date();
  const currentBulan = now.getMonth() + 1;
  const currentTahun = now.getFullYear();
  const todayStr = now.toISOString().split("T")[0];

  const BULAN_LIST = [
    { value: 1, label: "Januari" }, { value: 2, label: "Februari" },
    { value: 3, label: "Maret" }, { value: 4, label: "April" },
    { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
    { value: 7, label: "Juli" }, { value: 8, label: "Agustus" },
    { value: 9, label: "September" }, { value: 10, label: "Oktober" },
    { value: 11, label: "November" }, { value: 12, label: "Desember" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/iuran" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catat Pembayaran Iuran</h1>
          <p className="text-sm text-muted-foreground">Catat transaksi pembayaran iuran warga.</p>
        </div>
      </div>

      <form action={catatPembayaranIuran} className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-1 text-sm">
            <label className="font-medium">Pilih Warga <span className="text-red-500">*</span></label>
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
            <label className="font-medium">Jenis Iuran <span className="text-red-500">*</span></label>
            <select name="jenisIuranId" className="w-full p-2 border rounded-md text-sm bg-background" required>
              <option value="">-- Pilih Jenis Iuran --</option>
              {jenisIuranList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama} - Rp {Number(j.nominal).toLocaleString("id-ID")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Bulan Periode <span className="text-red-500">*</span></label>
              <select name="bulan" defaultValue={currentBulan} className="w-full p-2 border rounded-md text-sm bg-background" required>
                {BULAN_LIST.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium">Tahun Periode <span className="text-red-500">*</span></label>
              <input
                name="tahun"
                type="number"
                defaultValue={currentTahun}
                className="w-full p-2 border rounded-md text-sm font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Nominal Bayar (Rp) <span className="text-red-500">*</span></label>
              <input
                name="nominalBayar"
                type="number"
                placeholder="50000"
                className="w-full p-2 border rounded-md text-sm font-mono"
                required
              />
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium">Tanggal Pembayaran <span className="text-red-500">*</span></label>
              <input
                name="tanggalBayar"
                type="date"
                defaultValue={todayStr}
                className="w-full p-2 border rounded-md text-sm bg-background"
                required
              />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Keterangan / Catatan</label>
            <input
              name="keterangan"
              type="text"
              placeholder="Opsional: misal bayar lunas 3 bulan"
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/iuran" className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent">
            Batal
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            Simpan Transaksi
          </button>
        </div>
      </form>
    </div>
  );
}