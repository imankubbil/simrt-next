import { prisma } from "@/lib/prisma";
import { createMutasi, deleteMutasi } from "@/lib/actions/mutasi";
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, Heart, UserMinus } from "lucide-react";

export default async function MutasiPage() {
  const mutasiList = await prisma.mutasiPenduduk.findMany({
    include: { warga: { include: { user: true } } },
    orderBy: { tanggal: "desc" },
  }).catch(() => []);

  const wargaList = await prisma.warga.findMany({
    include: { user: true },
    orderBy: { user: { namaLengkap: "asc" } },
  }).catch(() => []);

  const totalLahir = mutasiList.filter((m) => m.jenisMutasi === "LAHIR").length;
  const totalMeninggal = mutasiList.filter((m) => m.jenisMutasi === "MENINGGAL").length;
  const totalMasuk = mutasiList.filter((m) => m.jenisMutasi === "PINDAH_MASUK").length;
  const totalKeluar = mutasiList.filter((m) => m.jenisMutasi === "PINDAH_KELUAR").length;

  const BADGES: Record<string, { label: string; color: string; icon: any }> = {
    LAHIR: { label: "Lahir", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Heart },
    MENINGGAL: { label: "Meninggal", color: "bg-red-100 text-red-700 border-red-200", icon: UserMinus },
    PINDAH_MASUK: { label: "Pindah Masuk", color: "bg-green-100 text-green-700 border-green-200", icon: ArrowDownLeft },
    PINDAH_KELUAR: { label: "Pindah Keluar", color: "bg-orange-100 text-orange-700 border-orange-200", icon: ArrowUpRight },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mutasi Penduduk</h1>
        <p className="text-muted-foreground text-sm mt-1">Catatan riwayat lahir, meninggal, pindah masuk, dan pindah keluar.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Lahir</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{totalLahir}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Meninggal</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{totalMeninggal}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Pindah Masuk</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{totalMasuk}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Pindah Keluar</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{totalKeluar}</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Form Catat Mutasi
        </h2>
        <form action={createMutasi} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Warga <span className="text-red-500">*</span></label>
              <select name="wargaId" className="w-full p-2 border rounded-md text-sm bg-background" required>
                <option value="">-- Pilih Warga --</option>
                {wargaList.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.user.namaLengkap} ({w.user.nik})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium">Jenis Mutasi <span className="text-red-500">*</span></label>
              <select name="jenisMutasi" className="w-full p-2 border rounded-md text-sm bg-background" required>
                <option value="LAHIR">Lahir</option>
                <option value="MENINGGAL">Meninggal</option>
                <option value="PINDAH_MASUK">Pindah Masuk</option>
                <option value="PINDAH_KELUAR">Pindah Keluar</option>
              </select>
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium">Tanggal <span className="text-red-500">*</span></label>
              <input
                name="tanggal"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full p-2 border rounded-md text-sm bg-background"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Alamat Asal / Tempat Meninggal</label>
              <input name="alamatAsal" type="text" placeholder="Asal daerah / lokasi" className="w-full p-2 border rounded-md text-sm" />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">Alamat Tujuan / Penyebab</label>
              <input name="alamatTujuan" type="text" placeholder="Tujuan / Keterangan penyebab" className="w-full p-2 border rounded-md text-sm" />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Keterangan Tambahan</label>
            <input name="keterangan" type="text" placeholder="Catatan opsional" className="w-full p-2 border rounded-md text-sm" />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
              Simpan Mutasi
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Jenis Mutasi</th>
              <th className="p-4">Nama Warga</th>
              <th className="p-4">Detail / Alamat</th>
              <th className="p-4">Keterangan</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mutasiList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Belum ada riwayat mutasi penduduk.
                </td>
              </tr>
            ) : (
              mutasiList.map((m) => {
                const badge = BADGES[m.jenisMutasi] || BADGES.LAHIR;
                const Icon = badge.icon;
                const deleteAction = deleteMutasi.bind(null, m.id);

                return (
                  <tr key={m.id} className="hover:bg-muted/50">
                    <td className="p-4 font-mono">{new Date(m.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border font-medium ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{m.warga.user.namaLengkap} ({m.warga.user.nik})</td>
                    <td className="p-4">{m.alamatTujuan || m.alamatAsal || m.tempatMeninggal || "-"}</td>
                    <td className="p-4 text-muted-foreground">{m.keterangan || "-"}</td>
                    <td className="p-4 text-right">
                      <form action={deleteAction} className="inline">
                        <button type="submit" className="p-1.5 border rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

