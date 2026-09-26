import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Printer, Edit } from "lucide-react";
import { addAnggotaKeluarga, removeAnggotaKeluarga, deleteKartuKeluarga } from "@/lib/actions/kartu-keluarga";
import { formatTanggal, hitungUsia } from "@/lib/utils";

export default async function DetailKKPage({ params }: { params: { id: string } }) {
  const kk = await prisma.kartuKeluarga.findUnique({
    where: { id: params.id },
    include: {
      anggota: {
        include: { warga: { include: { user: true, jenisPekerjaan: true } } },
        orderBy: { tanggalMasuk: "asc" },
      },
    },
  });

  if (!kk) notFound();

  const wargaTersedia = await prisma.warga.findMany({
    where: { statusAktif: true, anggotaKK: null },
    include: { user: true },
    orderBy: { user: { namaLengkap: "asc" } },
  }).catch(() => []);

  const kepala = kk.anggota.find((a) => a.hubungan === "KEPALA_KELUARGA");
  const deleteKKAction = deleteKartuKeluarga.bind(null, kk.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/kartu-keluarga" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">KK {kk.nomorKK}</h1>
            <p className="text-sm text-muted-foreground">Kepala Keluarga: {kepala ? kepala.warga.user.namaLengkap : "-"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/kartu-keluarga/${kk.id}/cetak`} target="_blank" className="px-3 py-2 border rounded-md text-sm font-medium hover:bg-accent flex items-center gap-2">
            <Printer className="w-4 h-4" /> Cetak KK
          </Link>
          <Link href={`/kartu-keluarga/${kk.id}/edit`} className="px-3 py-2 border rounded-md text-sm font-medium hover:bg-accent flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Link>
          <form action={deleteKKAction}>
            <button type="submit" className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Hapus KK
            </button>
          </form>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-muted-foreground text-xs block">Nomor KK</span>
            <span className="font-mono font-medium">{kk.nomorKK}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">RT / RW</span>
            <span className="font-medium">{kk.rt || "-"} / {kk.rw || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Kode Pos</span>
            <span className="font-medium">{kk.kodePos || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Jumlah Anggota</span>
            <span className="font-medium">{kk.anggota.length} orang</span>
          </div>
        </div>
        <div>
          <span className="text-muted-foreground text-xs block">Alamat Alamat</span>
          <span className="font-medium">{kk.alamat}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Daftar Anggota Keluarga</h2>
        <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">NIK</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Usia</th>
                <th className="p-3">Hubungan</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {kk.anggota.map((a, idx) => {
                const removeAction = removeAnggotaKeluarga.bind(null, a.id, kk.id);
                return (
                  <tr key={a.id} className="hover:bg-muted/50">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-mono">{a.warga.user.nik}</td>
                    <td className="p-3 font-medium">{a.warga.user.namaLengkap}</td>
                    <td className="p-3">{a.warga.user.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</td>
                    <td className="p-3">
                      {a.warga.user.tanggalLahir ? `${hitungUsia(new Date(a.warga.user.tanggalLahir))} th` : "-"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${a.hubungan === "KEPALA_KELUARGA" ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"}`}>
                        {a.hubungan.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {a.hubungan !== "KEPALA_KELUARGA" && (
                        <form action={removeAction} className="inline">
                          <button type="submit" className="p-1 text-red-600 hover:bg-red-50 rounded" title="Keluarkan dari KK">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-5 space-y-4 shadow-sm">
        <h3 className="font-semibold text-sm">Tambah Anggota Keluarga</h3>
        <form action={addAnggotaKeluarga} className="flex flex-col md:flex-row gap-3">
          <input type="hidden" name="kartuKeluargaId" value={kk.id} />
          <select name="wargaId" className="flex-1 p-2 border rounded-md text-sm bg-background" required>
            <option value="">-- Pilih Warga yang Belum Punya KK --</option>
            {wargaTersedia.map((w) => (
              <option key={w.id} value={w.id}>
                {w.user.namaLengkap} (NIK: {w.user.nik})
              </option>
            ))}
          </select>
          <select name="hubungan" className="p-2 border rounded-md text-sm bg-background" required>
            <option value="ISTRI">Istri</option>
            <option value="ANAK">Anak</option>
            <option value="MENANTU">Menantu</option>
            <option value="CUCU">Cucu</option>
            <option value="ORANG_TUA">Orang Tua</option>
            <option value="MERTUA">Mertua</option>
            <option value="FAMILI_LAIN">Famili Lain</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </form>
      </div>
    </div>
  );
}