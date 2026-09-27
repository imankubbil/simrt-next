import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2, Briefcase } from "lucide-react";
import { deleteWarga } from "@/lib/actions/warga";

export default async function WargaPage() {
  const wargaList = await prisma.warga.findMany({
    include: { user: true, jenisPekerjaan: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Warga</h1>
          <p className="text-muted-foreground text-sm mt-1">Daftar semua warga RT terdaftar.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/warga/pekerjaan" className="border bg-card hover:bg-accent text-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Kelola Pekerjaan
          </Link>
          <Link href="/warga/tambah" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Tambah Warga
          </Link>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium">
            <tr>
              <th className="p-4">NIK</th>
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">Gender</th>
              <th className="p-4">Agama</th>
              <th className="p-4">Pekerjaan</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {wargaList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Belum ada data warga. Klik "+ Tambah Warga" untuk menambahkan.
                </td>
              </tr>
            ) : (
              wargaList.map((w) => {
                const deleteAction = deleteWarga.bind(null, w.id);
                return (
                  <tr key={w.id} className="hover:bg-muted/50">
                    <td className="p-4 font-mono font-medium">{w.user.nik}</td>
                    <td className="p-4 font-medium">{w.user.namaLengkap}</td>
                    <td className="p-4">{w.user.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</td>
                    <td className="p-4">{w.user.agama}</td>
                    <td className="p-4">{w.jenisPekerjaan?.nama || "-"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${w.statusAktif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {w.statusAktif ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/warga/${w.id}`} className="p-1.5 border rounded hover:bg-accent text-muted-foreground hover:text-foreground" title="Detail">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/warga/${w.id}/edit`} className="p-1.5 border rounded hover:bg-accent text-muted-foreground hover:text-foreground" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <form action={deleteAction} className="inline">
                          <button type="submit" className="p-1.5 border rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
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

