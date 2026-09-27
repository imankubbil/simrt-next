import { prisma } from "@/lib/prisma";
import { createJenisPekerjaan, deleteJenisPekerjaan } from "@/lib/actions/pekerjaan";
import Link from "next/link";
import { ArrowLeft, Plus, Briefcase, Trash2 } from "lucide-react";

export default async function PekerjaanPage() {
  const pekerjaanList = await prisma.jenisPekerjaan.findMany({
    include: { _count: { select: { wargaList: true } } },
    orderBy: { nama: "asc" },
  }).catch(() => []);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/warga" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Jenis Pekerjaan</h1>
          <p className="text-muted-foreground text-sm mt-1">Daftar kategori pekerjaan warga terdaftar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Tambah Pekerjaan
          </h2>
          <form action={createJenisPekerjaan} className="space-y-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Nama Pekerjaan <span className="text-red-500">*</span></label>
              <input
                name="nama"
                type="text"
                placeholder="Misal: Arsitek, Bidan"
                className="w-full p-2 border rounded-md text-sm"
                required
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">Keterangan</label>
              <input
                name="keterangan"
                type="text"
                placeholder="Catatan opsional"
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
              Simpan Pekerjaan
            </button>
          </form>
        </div>

        <div className="bg-card border rounded-lg overflow-hidden shadow-sm lg:col-span-2">
          <div className="p-4 border-b flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Daftar Jenis Pekerjaan ({pekerjaanList.length})</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium">
              <tr>
                <th className="p-4">Nama Pekerjaan</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4">Jumlah Warga</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pekerjaanList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Belum ada master data pekerjaan.
                  </td>
                </tr>
              ) : (
                pekerjaanList.map((p) => {
                  const deleteAction = deleteJenisPekerjaan.bind(null, p.id);
                  return (
                    <tr key={p.id} className="hover:bg-muted/50">
                      <td className="p-4 font-medium">{p.nama}</td>
                      <td className="p-4 text-muted-foreground">{p.keterangan || "-"}</td>
                      <td className="p-4 font-semibold">{p._count.wargaList} orang</td>
                      <td className="p-4 text-right">
                        <form action={deleteAction} className="inline">
                          <button
                            type="submit"
                            className="p-1.5 border rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            title="Hapus"
                          >
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
    </div>
  );
}

