import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User, ShieldCheck, Home } from "lucide-react";

export default async function PortalProfilPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { nik: session.user.email },
        include: {
          warga: {
            include: {
              jenisPekerjaan: true,
              anggotaKK: { include: { kartuKeluarga: true } },
            },
          },
        },
      })
    : null;

  const warga = user?.warga;
  const kk = warga?.anggotaKK?.kartuKeluarga;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground text-sm mt-1">Informasi data kependudukan terdaftar.</p>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
            {user?.namaLengkap ? user.namaLengkap.charAt(0) : "W"}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.namaLengkap}</h2>
            <p className="text-sm font-mono text-muted-foreground">NIK: {user?.nik}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
              <ShieldCheck className="w-3 h-3" /> Warga Aktif
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Data Pribadi
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p><strong className="text-foreground">Jenis Kelamin:</strong> {user?.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</p>
              <p><strong className="text-foreground">Tempat, Tgl Lahir:</strong> {user?.tempatLahir || "-"}, {user?.tanggalLahir ? new Date(user.tanggalLahir).toLocaleDateString("id-ID") : "-"}</p>
              <p><strong className="text-foreground">Agama:</strong> {user?.agama}</p>
              <p><strong className="text-foreground">Pekerjaan:</strong> {warga?.jenisPekerjaan?.nama || "-"}</p>
              <p><strong className="text-foreground">Kewarganegaraan:</strong> {warga?.kewarganegaraan || "WNI"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Home className="w-4 h-4 text-primary" /> Alamat & Tempat Tinggal
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p><strong className="text-foreground">Alamat Domisili:</strong> {warga?.alamat || "-"}</p>
              <p><strong className="text-foreground">Nomor KK:</strong> {kk?.nomorKK || "Belum Terdaftar"}</p>
              <p><strong className="text-foreground">Hubungan KK:</strong> {warga?.anggotaKK?.hubungan || "-"}</p>
              <p><strong className="text-foreground">Nama Ayah:</strong> {warga?.namaAyah || "-"}</p>
              <p><strong className="text-foreground">Nama Ibu:</strong> {warga?.namaIbu || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

