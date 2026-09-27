import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreditCard, CheckCircle } from "lucide-react";

export default async function PortalIuranPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { nik: session.user.email },
        include: { warga: true },
      })
    : null;

  const wargaId = user?.warga?.id;

  const iuranList = wargaId
    ? await prisma.pembayaranIuran.findMany({
        where: { wargaId },
        include: { jenisIuran: true },
        orderBy: [{ tahun: "desc" }, { bulan: "desc" }],
      }).catch(() => [])
    : [];

  const totalBayar = iuranList.reduce((acc, i) => acc + Number(i.nominalBayar), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Pembayaran Iuran</h1>
        <p className="text-muted-foreground text-sm mt-1">Catatan pembayaran iuran kebersihan, keamanan, dan kas RT.</p>
      </div>

      <div className="bg-card border rounded-lg p-6 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Total Nominal Terbayar</p>
          <p className="text-3xl font-bold mt-1 text-green-600">Rp {totalBayar.toLocaleString("id-ID")}</p>
        </div>
        <div className="p-4 bg-green-100 rounded-full text-green-700">
          <CreditCard className="w-8 h-8" />
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Daftar Transaksi Iuran Saya</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Tanggal Bayar</th>
              <th className="p-4">Jenis Iuran</th>
              <th className="p-4">Periode Bulan / Tahun</th>
              <th className="p-4">Nominal Bayar</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {iuranList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Belum ada catatan pembayaran iuran.
                </td>
              </tr>
            ) : (
              iuranList.map((i) => (
                <tr key={i.id} className="hover:bg-muted/50">
                  <td className="p-4 font-mono">{new Date(i.tanggalBayar).toLocaleDateString("id-ID")}</td>
                  <td className="p-4 font-medium">{i.jenisIuran.nama}</td>
                  <td className="p-4 font-mono">Bulan {i.bulan} / {i.tahun}</td>
                  <td className="p-4 font-semibold text-green-600">Rp {Number(i.nominalBayar).toLocaleString("id-ID")}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border bg-green-100 text-green-700 border-green-200 font-medium">
                      <CheckCircle className="w-3 h-3" /> Lunas
                    </span>
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

