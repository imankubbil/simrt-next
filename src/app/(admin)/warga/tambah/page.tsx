import { prisma } from "@/lib/prisma";
import { createWarga } from "@/lib/actions/warga";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TambahWargaPage() {
  const pekerjaanList = await prisma.jenisPekerjaan.findMany({
    orderBy: { nama: "asc" },
  }).catch(() => []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/warga" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Warga Baru</h1>
          <p className="text-sm text-muted-foreground">Isi formulir data kependudukan warga.</p>
        </div>
      </div>

      <form action={createWarga} className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 text-sm">
            <label className="font-medium">NIK <span className="text-red-500">*</span></label>
            <input
              name="nik"
              type="text"
              maxLength={16}
              placeholder="3515..."
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Nama Lengkap <span className="text-red-500">*</span></label>
            <input
              name="namaLengkap"
              type="text"
              placeholder="Nama sesuai KTP"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Jenis Kelamin</label>
            <select name="jenisKelamin" className="w-full p-2 border rounded-md text-sm bg-background">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Agama</label>
            <select name="agama" className="w-full p-2 border rounded-md text-sm bg-background">
              <option value="ISLAM">Islam</option>
              <option value="KRISTEN">Kristen</option>
              <option value="KATOLIK">Katolik</option>
              <option value="HINDU">Hindu</option>
              <option value="BUDHA">Budha</option>
              <option value="KONGHUCU">Konghucu</option>
            </select>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Tempat Lahir</label>
            <input
              name="tempatLahir"
              type="text"
              placeholder="Kota/Kabupaten"
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Tanggal Lahir</label>
            <input
              name="tanggalLahir"
              type="date"
              className="w-full p-2 border rounded-md text-sm bg-background"
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Pekerjaan</label>
            <select name="jenisPekerjaanId" className="w-full p-2 border rounded-md text-sm bg-background">
              <option value="">-- Pilih Pekerjaan --</option>
              {pekerjaanList.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Kewarganegaraan</label>
            <select name="kewarganegaraan" className="w-full p-2 border rounded-md text-sm bg-background">
              <option value="WNI">WNI</option>
              <option value="WNA">WNA</option>
            </select>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Nama Ayah</label>
            <input
              name="namaAyah"
              type="text"
              placeholder="Nama Ayah Kandung"
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Nama Ibu</label>
            <input
              name="namaIbu"
              type="text"
              placeholder="Nama Ibu Kandung"
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <label className="font-medium">Alamat Domisili</label>
          <textarea
            name="alamat"
            rows={3}
            placeholder="Alamat domisili saat ini"
            className="w-full p-2 border rounded-md text-sm resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/warga" className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent">
            Batal
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            Simpan Warga
          </button>
        </div>
      </form>
    </div>
  );
}
