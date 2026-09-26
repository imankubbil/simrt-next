import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { formatTanggal, hitungUsia } from "@/lib/utils";
import { deleteWarga } from "@/lib/actions/warga";

export default async function DetailWargaPage({ params }: { params: { id: string } }) {
  const warga = await prisma.warga.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      jenisPekerjaan: true,
      anggotaKK: { include: { kartuKeluarga: true } },
    },
  });

  if (!warga) notFound();

  const deleteAction = deleteWarga.bind(null, warga.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/warga" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{warga.user.namaLengkap}</h1>
            <p className="text-sm font-mono text-muted-foreground">NIK: {warga.user.nik}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/warga/${warga.id}/edit`} className="px-3 py-2 border rounded-md text-sm font-medium hover:bg-accent flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Link>
          <form action={deleteAction}>
            <button type="submit" className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Hapus
            </button>
          </form>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">Jenis Kelamin</span>
            <span className="font-medium">{warga.user.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Agama</span>
            <span className="font-medium">{warga.user.agama}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Tempat, Tanggal Lahir</span>
            <span className="font-medium">
              {warga.user.tempatLahir || "-"}, {warga.user.tanggalLahir ? formatTanggal(new Date(warga.user.tanggalLahir)) : "-"}
              {warga.user.tanggalLahir && ` (${hitungUsia(new Date(warga.user.tanggalLahir))} tahun)`}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Pekerjaan</span>
            <span className="font-medium">{warga.jenisPekerjaan?.nama || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Kewarganegaraan</span>
            <span className="font-medium">{warga.kewarganegaraan}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Status Keaktifan</span>
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium mt-0.5 ${warga.statusAktif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {warga.statusAktif ? "Aktif" : `Tidak Aktif (${warga.kategoriTidakAktif || "-"})`}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Nama Ayah</span>
            <span className="font-medium">{warga.namaAyah || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Nama Ibu</span>
            <span className="font-medium">{warga.namaIbu || "-"}</span>
          </div>
        </div>
        <div className="pt-4 border-t text-sm">
          <span className="text-muted-foreground block text-xs mb-1">Alamat Domisili</span>
          <p className="font-medium">{warga.alamat || "-"}</p>
        </div>
        {warga.anggotaKK && (
          <div className="pt-4 border-t text-sm">
            <span className="text-muted-foreground block text-xs mb-1">Kartu Keluarga</span>
            <p className="font-mono font-medium">No. KK: {warga.anggotaKK.kartuKeluarga.nomorKK}</p>
            <p className="text-xs text-muted-foreground">Hubungan: {warga.anggotaKK.hubungan}</p>
          </div>
        )}
      </div>
    </div>
  );
}