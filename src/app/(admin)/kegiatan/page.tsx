import { prisma } from "@/lib/prisma";
import { createKegiatan, createJenisKegiatan, deleteKegiatan } from "@/lib/actions/kegiatan";
import { Calendar, Plus, MapPin, Trash2, Clock, CheckCircle } from "lucide-react";

export default async function KegiatanPage() {
  const kegiatanList = await prisma.kegiatan.findMany({
    include: { jenis: true },
    orderBy: { tanggalMulai: "desc" },
  }).catch(() => []);

  const jenisList = await prisma.jenisKegiatan.findMany({
    orderBy: { nama: "asc" },
  }).catch(() => []);

  const now = new Date();
  const mendatang = kegiatanList.filter((k) => new Date(k.tanggalMulai) > now).length;
  const selesai = kegiatanList.filter((k) => new Date(k.tanggalMulai) <= now).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda & Kegiatan RT</h1>
        <p className="text-muted-foreground text-sm mt-1">Pengelolaan jadwal kegiatan warga, gotong royong, dan musyawarah.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Agenda</p>
            <p className="text-2xl font-bold mt-1">{kegiatanList.length}</p>
          </div>
          <div className="p-3 bg-muted rounded-full text-purple-500">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Kegiatan Mendatang</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{mendatang}</p>
          </div>
          <div className="p-3 bg-muted rounded-full text-blue-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Kegiatan Selesai</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{selesai}</p>
          </div>
          <div className="p-3 bg-muted rounded-full text-green-500">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Tambah Jenis Kegiatan
          </h2>
          <form action={createJenisKegiatan} className="space-y-3">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Nama Jenis Kegiatan <span className="text-red-500">*</span></label>
              <input name="nama" type="text" placeholder="Misal: Gotong Royong, Arisan" className="w-full p-2 border rounded-md text-sm" required />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">Warna Label</label>
              <input name="warna" type="color" defaultValue="#3498db" className="w-full h-9 p-1 border rounded-md bg-background cursor-pointer" />
            </div>
            <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80">
              + Tambah Jenis
            </button>
          </form>

          {jenisList.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Daftar Kategori:</p>
              <div className="flex flex-wrap gap-2">
                {jenisList.map((j) => (
                  <span key={j.id} className="px-2.5 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: `${j.warna}15`, color: j.warna, borderColor: j.warna }}>
                    {j.nama}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Form Tambah Agenda Kegiatan
          </h2>
          <form action={createKegiatan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-sm">
                <label className="font-medium">Judul Kegiatan <span className="text-red-500">*</span></label>
                <input name="judul" type="text" placeholder="Judul acara" className="w-full p-2 border rounded-md text-sm" required />
              </div>

              <div className="space-y-1 text-sm">
                <label className="font-medium">Kategori Jenis <span className="text-red-500">*</span></label>
                <select name="jenisId" className="w-full p-2 border rounded-md text-sm bg-background" required>
                  <option value="">-- Pilih Kategori --</option>
                  {jenisList.map((j) => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-sm">
                <label className="font-medium">Tanggal Mulai <span className="text-red-500">*</span></label>
                <input name="tanggalMulai" type="datetime-local" className="w-full p-2 border rounded-md text-sm bg-background" required />
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium">Tanggal Selesai</label>
                <input name="tanggalSelesai" type="datetime-local" className="w-full p-2 border rounded-md text-sm bg-background" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-sm">
                <label className="font-medium">Lokasi</label>
                <input name="lokasi" type="text" placeholder="Misal: Pos Ronda RT 01" className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium">Berulang</label>
                <select name="berulang" className="w-full p-2 border rounded-md text-sm bg-background">
                  <option value="TIDAK">Tidak Berulang</option>
                  <option value="MINGGUAN">Mingguan</option>
                  <option value="BULANAN">Bulanan</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium">Deskripsi Kegiatan</label>
              <textarea name="deskripsi" rows={2} placeholder="Keterangan acara..." className="w-full p-2 border rounded-md text-sm resize-none" />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                Simpan Agenda
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Daftar Agenda & Kegiatan</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Kategori</th>
              <th className="p-4">Judul Acara</th>
              <th className="p-4">Jadwal Mulai</th>
              <th className="p-4">Lokasi</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {kegiatanList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Belum ada agenda kegiatan terdaftar.
                </td>
              </tr>
            ) : (
              kegiatanList.map((k) => {
                const isUpcoming = new Date(k.tanggalMulai) > new Date();
                const deleteAction = deleteKegiatan.bind(null, k.id);

                return (
                  <tr key={k.id} className="hover:bg-muted/50">
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: `${k.jenis.warna}15`, color: k.jenis.warna, borderColor: k.jenis.warna }}>
                        {k.jenis.nama}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      {k.judul}
                      {k.deskripsi && <p className="text-xs text-muted-foreground font-normal">{k.deskripsi}</p>}
                    </td>
                    <td className="p-4 font-mono">{new Date(k.tanggalMulai).toLocaleString("id-ID")}</td>
                    <td className="p-4">
                      {k.lokasi ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {k.lokasi}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${isUpcoming ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                        {isUpcoming ? "Mendatang" : "Selesai"}
                      </span>
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

