import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, CreditCard, Trash2 } from "lucide-react";
import { formatTanggal } from "@/lib/utils";
import { deletePembayaranIuran } from "@/lib/actions/iuran";

export default async function IuranPage() {
  const iuranList = await prisma.pembayaranIuran.findMany({
    include: { jenisIuran: true, warga: { include: { user: true } } },
    orderBy: [{ tahun: "desc" }, { bulan: "desc" }],
  }).catch(() => []);

  const jenisIuranList = await prisma.jenisIuran.findMany({
    orderBy: { nama: "asc" },
  }).catch(() => []);

  const totalPemasukan = iuranList.reduce((acc, item) => acc + Number(item.nominalBayar), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Iuran Warga</h1>
          <p className="text-muted-foreground text-sm mt-1">Catatan dan rekap pembayaran iuran RT.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/iuran/jenis/tambah" className="border bg-card hover:bg-accent text-card-foreground px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Jenis Iuran
          </Link>
          <Link href="/iuran/bayar" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Catat Pembayaran
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Terkumpul</p>
          <p className="text-2xl font-bold mt-1 text-green-600">Rp {totalPemasukan.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-card border rounded-lg p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Transaksi</p>
          <p className="text-2xl font-bold mt-1">{iuranList.length} transaksi</p>
        </div>
        <div className="bg-card border rounded-lg p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Jenis Iuran Aktif</p>
          <p className="text-2xl font-bold mt-1">{jenisIuranList.length} kategori</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/30 font-semibold text-sm">
          Riwayat Transaksi Iuran
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Nama Warga</th>
              <th className="p-4">Jenis Iuran</th>
              <th className="p-4">Periode</th>
              <th className="p-4">Nominal</th>
              <th className="p-4">Tanggal Bayar</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {iuranList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Belum ada transaksi pembayaran iuran.
                </td>
              </tr>
            ) : (
              iuranList.map((item) => {
                const deleteAction = deletePembayaranIuran.bind(null, item.id);
                return (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="p-4 font-medium">{item.warga.user.namaLengkap}</td>
                    <td className="p-4">{item.jenisIuran.nama}</td>
                    <td className="p-4 font-mono font-medium">Bulan {item.bulan}/{item.tahun}</td>
                    <td className="p-4 font-mono font-bold text-green-700">Rp {Number(item.nominalBayar).toLocaleString("id-ID")}</td>
                    <td className="p-4">{formatTanggal(new Date(item.tanggalBayar))}</td>
                    <td className="p-4 text-right">
                      <form action={deleteAction} className="inline">
                        <button type="submit" className="p-1.5 border rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Batal Transaksi">
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