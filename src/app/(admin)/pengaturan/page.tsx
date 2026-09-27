import { prisma } from "@/lib/prisma";
import { updateKonfigurasiSistem } from "@/lib/actions/pengaturan";
import { Settings, Save } from "lucide-react";

export default async function PengaturanPage() {
  const sistem = await prisma.konfigurasiSistem.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const wargaList = await prisma.warga.findMany({
    include: { user: true },
    orderBy: { user: { namaLengkap: "asc" } },
  }).catch(() => []);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <p className="text-muted-foreground text-sm mt-1">Konfigurasi wilayah, nomor RT/RW, dan pengurus RT.</p>
      </div>

      <form action={updateKonfigurasiSistem} className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-4">
          <Settings className="w-5 h-5 text-primary" /> Identitas Wilayah RT / RW
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 text-sm">
            <label className="font-medium">Kabupaten / Kota</label>
            <input name="kabupaten" type="text" defaultValue={sistem?.kabupaten || ""} placeholder="Misal: Sidoarjo" className="w-full p-2 border rounded-md text-sm" />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Kecamatan</label>
            <input name="kecamatan" type="text" defaultValue={sistem?.kecamatan || ""} placeholder="Misal: Candi" className="w-full p-2 border rounded-md text-sm" />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Desa / Kelurahan</label>
            <input name="desa" type="text" defaultValue={sistem?.desa || ""} placeholder="Misal: Gelam" className="w-full p-2 border rounded-md text-sm" />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Dusun / Lingkungan</label>
            <input name="dusun" type="text" defaultValue={sistem?.dusun || ""} placeholder="Misal: Dusun Krajan" className="w-full p-2 border rounded-md text-sm" />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Nomor RT</label>
            <input name="rt" type="text" defaultValue={sistem?.rt || "001"} placeholder="001" className="w-full p-2 border rounded-md text-sm" />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Nomor RW</label>
            <input name="rw" type="text" defaultValue={sistem?.rw || "005"} placeholder="005" className="w-full p-2 border rounded-md text-sm" />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Kode Pos</label>
            <input name="kodePos" type="text" defaultValue={sistem?.kodePos || ""} placeholder="61271" className="w-full p-2 border rounded-md text-sm" />
          </div>
        </div>

        <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 pt-4">
          Pengurus Wilayah
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 text-sm">
            <label className="font-medium">Ketua RT</label>
            <select name="ketuaRtId" defaultValue={sistem?.ketuaRtId || ""} className="w-full p-2 border rounded-md text-sm bg-background">
              <option value="">-- Pilih Ketua RT --</option>
              {wargaList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.user.namaLengkap} ({w.user.nik})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Ketua RW</label>
            <select name="ketuaRwId" defaultValue={sistem?.ketuaRwId || ""} className="w-full p-2 border rounded-md text-sm bg-background">
              <option value="">-- Pilih Ketua RW --</option>
              {wargaList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.user.namaLengkap} ({w.user.nik})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Save className="w-4 h-4" /> Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
}

