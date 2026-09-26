import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Eye, FilePlus } from "lucide-react";
import { formatTanggal } from "@/lib/utils";

export default async function SuratPage() {
  const suratList = await prisma.surat.findMany({
    include: { jenisSurat: true, warga: { include: { user: true } } },
    orderBy: { tanggal: "desc" },
  }).catch(() => []);

  const jenisSuratList = await prisma.jenisSurat.findMany({
    orderBy: { nama: "asc" },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surat Keterangan</h1>
          <p className="text-muted-foreground text-sm mt-1">Pengelolaan penerbitan surat & template.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/surat/jenis/tambah" className="border bg-card hover:bg-accent text-card-foreground px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
            <FilePlus className="w-4 h-4" /> Jenis Surat
          </Link>
          <Link href="/surat/buat" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Buat Surat
          </Link>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/30 font-semibold text-sm">
          Jenis Surat Tersedia ({jenisSuratList.length})
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {jenisSuratList.map((j) => (
            <span key={j.id} className="bg-primary/10 text-primary border border-primary/20 text-xs px-3 py-1.5 rounded-full font-medium">
              [{j.kodePrefix}] {j.nama}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/30 font-semibold text-sm">
          Daftar Surat Diterbitkan
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Nomor Surat</th>
              <th className="p-4">Jenis</th>
              <th className="p-4">Pemohon</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {suratList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Belum ada surat diterbitkan. Klik "+ Buat Surat" untuk membuat.
                </td>
              </tr>
            ) : (
              suratList.map((s) => (
                <tr key={s.id} className="hover:bg-muted/50">
                  <td className="p-4 font-mono font-medium">{s.nomorSurat}</td>
                  <td className="p-4">{s.jenisSurat.nama}</td>
                  <td className="p-4 font-medium">{s.warga.user.namaLengkap}</td>
                  <td className="p-4">{formatTanggal(new Date(s.tanggal))}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/surat/${s.id}`} className="p-1.5 border rounded hover:bg-accent text-muted-foreground hover:text-foreground inline-block">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}