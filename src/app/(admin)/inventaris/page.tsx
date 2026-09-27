import { prisma } from "@/lib/prisma";
import { createAset, createKategoriAset, deleteAset } from "@/lib/actions/inventaris";
import { Package, Plus, MapPin, Trash2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default async function InventarisPage() {
  const asetList = await prisma.aset.findMany({
    include: { kategori: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const kategoriList = await prisma.kategoriAset.findMany({
    orderBy: { nama: "asc" },
  }).catch(() => []);

  const totalAset = asetList.reduce((acc, a) => acc + a.jumlah, 0);
  const baik = asetList.filter((a) => a.kondisi === "BAIK").reduce((acc, a) => acc + a.jumlah, 0);
  const rusakRingan = asetList.filter((a) => a.kondisi === "RUSAK_RINGAN").reduce((acc, a) => acc + a.jumlah, 0);
  const rusakBerat = asetList.filter((a) => a.kondisi === "RUSAK_BERAT").reduce((acc, a) => acc + a.jumlah, 0);

  const BADGES: Record<string, { label: string; color: string; icon: any }> = {
    BAIK: { label: "Baik", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    RUSAK_RINGAN: { label: "Rusak Ringan", color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
    RUSAK_BERAT: { label: "Rusak Berat", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventaris Aset RT</h1>
        <p className="text-muted-foreground text-sm mt-1">Pencatatan fasilitas, barang, dan inventaris warga RT.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Barang</p>
          <p className="text-2xl font-bold mt-1 text-purple-600">{totalAset}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Kondisi Baik</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{baik}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Rusak Ringan</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{rusakRingan}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Rusak Berat</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{rusakBerat}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Kategori Aset
          </h2>
          <form action={createKategoriAset} className="space-y-3">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Nama Kategori <span className="text-red-500">*</span></label>
              <input name="nama" type="text" placeholder="Misal: Elektronik, Tenda" className="w-full p-2 border rounded-md text-sm" required />
            </div>
            <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80">
              + Tambah Kategori
            </button>
          </form>

          {kategoriList.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Daftar Kategori:</p>
              <div className="flex flex-wrap gap-2">
                {kategoriList.map((k) => (
                  <span key={k.id} className="px-2.5 py-1 rounded-full text-xs font-medium border bg-muted">
                    {k.nama}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Form Catat Aset Baru
          </h2>
          <form action={createAset} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 text-sm">
                <label className="font-medium">Kode Aset <span className="text-red-500">*</span></label>
                <input name="kode" type="text" placeholder="AST-001" className="w-full p-2 border rounded-md text-sm font-mono uppercase" required />
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium">Nama Barang <span className="text-red-500">*</span></label>
                <input name="nama" type="text" placeholder="Nama aset" className="w-full p-2 border rounded-md text-sm" required />
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium">Kategori <span className="text-red-500">*</span></label>
                <select name="kategoriId" className="w-full p-2 border rounded-md text-sm bg-background" required>
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 text-sm">
                <label className="font-medium">Jumlah</label>
                <input name="jumlah" type="number" defaultValue={1} min={1} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium">Kondisi</label>
                <select name="kondisi" className="w-full p-2 border rounded-md text-sm bg-background">
                  <option value="BAIK">Baik</option>
                  <option value="RUSAK_RINGAN">Rusak Ringan</option>
                  <option value="RUSAK_BERAT">Rusak Berat</option>
                </select>
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium">Tanggal Perolehan</label>
                <input name="tanggalPerolehan" type="date" className="w-full p-2 border rounded-md text-sm bg-background" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-sm">
                <label className="font-medium">Lokasi Penyimpanan</label>
                <input name="lokasiPenyimpanan" type="text" placeholder="Misal: Gudang RT" className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium">Nilai Perolehan (Rp)</label>
                <input name="nilaiPerolehan" type="number" placeholder="0" className="w-full p-2 border rounded-md text-sm" />
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium">Keterangan</label>
              <input name="keterangan" type="text" placeholder="Catatan tambahan" className="w-full p-2 border rounded-md text-sm" />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                Simpan Aset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Daftar Inventaris Barang</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Kode</th>
              <th className="p-4">Nama Aset</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Jumlah</th>
              <th className="p-4">Kondisi</th>
              <th className="p-4">Lokasi</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {asetList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Belum ada inventaris barang terdaftar.
                </td>
              </tr>
            ) : (
              asetList.map((a) => {
                const badge = BADGES[a.kondisi] || BADGES.BAIK;
                const Icon = badge.icon;
                const deleteAction = deleteAset.bind(null, a.id);

                return (
                  <tr key={a.id} className="hover:bg-muted/50">
                    <td className="p-4 font-mono font-medium">{a.kode}</td>
                    <td className="p-4 font-medium">
                      {a.nama}
                      {a.keterangan && <p className="text-xs text-muted-foreground font-normal">{a.keterangan}</p>}
                    </td>
                    <td className="p-4">{a.kategori.nama}</td>
                    <td className="p-4 font-semibold">{a.jumlah} unit</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border font-medium ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-4">
                      {a.lokasiPenyimpanan ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {a.lokasiPenyimpanan}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
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

