import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ajukanSuratWarga } from "@/lib/actions/portal";
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function PortalSuratPage() {
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
      }).catch(() => [])
    : [];

  const jenisSuratList = await prisma.jenisSurat.findMany({
    where: { aktif: true },
    orderBy: { nama: "asc" },
  }).catch(() => []);

  const BADGES: Record<string, { label: string; color: string; icon: any }> = {
    DIAJUKAN: { label: "Diajukan", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
    DISETUJUI: { label: "Disetujui", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
    SELESAI: { label: "Selesai / Dicetak", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    DITOLAK: { label: "Ditolak", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Layanan Surat Warga</h1>
        <p className="text-muted-foreground text-sm mt-1">Ajukan surat pengantar/keterangan RT dan pantau statusnya.</p>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Formulir Ajukan Surat Baru
        </h2>
        <form action={ajukanSuratWarga} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Jenis Surat <span className="text-red-500">*</span></label>
              <select name="jenisSuratId" className="w-full p-2 border rounded-md text-sm bg-background" required>
                <option value="">-- Pilih Jenis Surat --</option>
                {jenisSuratList.map((j) => (
                  <option key={j.id} value={j.id}>{j.nama}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium">Keperluan <span className="text-red-500">*</span></label>
              <input name="keperluan" type="text" placeholder="Misal: Pengurusan KTP / KK Baru" className="w-full p-2 border rounded-md text-sm" required />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
              Kirim Pengajuan
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Riwayat Pengajuan Surat Saya</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Nomor Surat</th>
              <th className="p-4">Jenis Surat</th>
              <th className="p-4">Keperluan</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {suratList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Belum ada riwayat pengajuan surat.
                </td>
              </tr>
            ) : (
              suratList.map((s) => {
                const badge = BADGES[s.status] || BADGES.DIAJUKAN;
                const Icon = badge.icon;

                return (
                  <tr key={s.id} className="hover:bg-muted/50">
                    <td className="p-4 font-mono">{new Date(s.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="p-4 font-mono font-medium">{s.nomorSurat}</td>
                    <td className="p-4 font-medium">{s.jenisSurat.nama}</td>
                    <td className="p-4 text-muted-foreground">{s.keperluan}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border font-medium ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
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

