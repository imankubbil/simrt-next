import { prisma } from "@/lib/prisma";
import { Users, UserCheck, Building2, FileText, CreditCard, History } from "lucide-react";

async function getStats() {
  try {
    const totalWarga = await prisma.warga.count({ where: { statusAktif: true, wargaSementara: null } });
    const totalSementara = await prisma.wargaSementara.count({ where: { tanggalKeluar: null } });
    const totalKK = await prisma.kartuKeluarga.count();
    const totalSurat = await prisma.surat.count();
    const totalLaki = await prisma.user.count({ where: { jenisKelamin: "L" } });
    const totalPerempuan = await prisma.user.count({ where: { jenisKelamin: "P" } });

    return { totalWarga, totalSementara, totalKK, totalSurat, totalLaki, totalPerempuan };
  } catch (e) {
    return { totalWarga: 0, totalSementara: 0, totalKK: 0, totalSurat: 0, totalLaki: 0, totalPerempuan: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const CARDS = [
    { label: "Warga Tetap", value: stats.totalWarga, icon: Users, color: "text-blue-500" },
    { label: "Warga Sementara", value: stats.totalSementara, icon: UserCheck, color: "text-green-500" },
    { label: "Kartu Keluarga", value: stats.totalKK, icon: Building2, color: "text-purple-500" },
    { label: "Surat Terbit", value: stats.totalSurat, icon: FileText, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Beranda</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ringkasan statistik data kependudukan dan kegiatan RT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-card border rounded-lg p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-3 bg-muted rounded-full ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Komposisi Gender</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>Laki-Laki</span>
              <span className="font-semibold">{stats.totalLaki}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${stats.totalWarga ? (stats.totalLaki / (stats.totalLaki + stats.totalPerempuan)) * 100 : 50}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Perempuan</span>
              <span className="font-semibold">{stats.totalPerempuan}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full"
                style={{ width: `${stats.totalWarga ? (stats.totalPerempuan / (stats.totalLaki + stats.totalPerempuan)) * 100 : 50}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <a href="/warga/tambah" className="p-3 border rounded-md hover:bg-accent text-center font-medium block">
              + Tambah Warga
            </a>
            <a href="/kartu-keluarga/tambah" className="p-3 border rounded-md hover:bg-accent text-center font-medium block">
              + Tambah KK
            </a>
            <a href="/surat/buat" className="p-3 border rounded-md hover:bg-accent text-center font-medium block">
              + Buat Surat
            </a>
            <a href="/iuran/bayar" className="p-3 border rounded-md hover:bg-accent text-center font-medium block">
              + Catat Iuran
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
