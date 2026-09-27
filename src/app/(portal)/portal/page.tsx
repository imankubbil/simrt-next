import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { FileText, CreditCard, User, Clock, CheckCircle } from "lucide-react";

export default async function PortalDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { nik: session.user.email },
        include: { warga: true },
      })
    : null;

  const wargaId = user?.warga?.id;

  const suratList = wargaId
    ? await prisma.surat.findMany({
        where: { wargaId },
        include: { jenisSurat: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }).catch(() => [])
    : [];

  const iuranList = wargaId
    ? await prisma.pembayaranIuran.findMany({
        where: { wargaId },
        include: { jenisIuran: true },
        orderBy: { tanggalBayar: "desc" },
        take: 5,
      }).catch(() => [])
    : [];

  const diajukan = suratList.filter((s) => s.status === "DIAJUKAN").length;
  const selesai = suratList.filter((s) => s.status === "SELESAI").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Selamat Datang, {user?.namaLengkap || "Warga"}</h1>
        <p className="text-muted-foreground text-sm mt-1">NIK: {user?.nik || "-"} | Layanan mandiri kependudukan RT.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Surat Diajukan</p>
            <p className="text-2xl font-bold mt-1 text-orange-600">{diajukan}</p>
          </div>
          <div className="p-3 bg-muted rounded-full text-orange-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Surat Selesai</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{selesai}</p>
          </div>
          <div className="p-3 bg-muted rounded-full text-green-500">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Iuran Terbayar</p>
            <p className="text-2xl font-bold mt-1 text-purple-600">{iuranList.length} Transaksi</p>
          </div>
          <div className="p-3 bg-muted rounded-full text-purple-500">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Riwayat Pengajuan Surat
            </h2>
            <Link href="/portal/surat" className="text-xs text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          {suratList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Belum ada pengajuan surat.</p>
          ) : (
            <div className="space-y-3">
              {suratList.map((s) => (
                <div key={s.id} className="p-3 border rounded-md flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{s.jenisSurat.nama}</p>
                    <p className="text-xs text-muted-foreground">{s.nomorSurat}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      s.status === "SELESAI"
                        ? "bg-green-100 text-green-700"
                        : s.status === "DIAJUKAN"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Riwayat Pembayaran Iuran
            </h2>
            <Link href="/portal/iuran" className="text-xs text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          {iuranList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Belum ada catatan iuran.</p>
          ) : (
            <div className="space-y-3">
              {iuranList.map((i) => (
                <div key={i.id} className="p-3 border rounded-md flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{i.jenisIuran.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      Periode {i.bulan}/{i.tahun}
                    </p>
                  </div>
                  <span className="font-semibold text-green-600">Rp {Number(i.nominalBayar).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

