import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function KartuKeluargaPage() {
  const kkList = await prisma.kartuKeluarga.findMany({
    include: { anggota: { include: { warga: { include: { user: true } } } } },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kartu Keluarga</h1>
          <p className="text-muted-foreground text-sm mt-1">Daftar Kartu Keluarga terdaftar.</p>
        </div>
        <Link href="/kartu-keluarga/tambah" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Tambah KK
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kkList.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground bg-card border rounded-lg">
            Belum ada data Kartu Keluarga.
          </div>
        ) : (
          kkList.map((kk) => {
            const kepala = kk.anggota.find((a) => a.hubungan === "KEPALA_KELUARGA");
            return (
              <div key={kk.id} className="bg-card border rounded-lg p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{kk.nomorKK}</p>
                    <p className="font-semibold text-lg mt-1">{kepala ? kepala.warga.user.namaLengkap : "-"}</p>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">
                    {kk.anggota.length} Anggota
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{kk.alamat}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
