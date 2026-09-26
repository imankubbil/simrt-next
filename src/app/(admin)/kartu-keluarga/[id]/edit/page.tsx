import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateKartuKeluarga } from "@/lib/actions/kartu-keluarga";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditKKPage({ params }: { params: { id: string } }) {
  const kk = await prisma.kartuKeluarga.findUnique({ where: { id: params.id } });
  if (!kk) notFound();

  const updateAction = updateKartuKeluarga.bind(null, kk.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/kartu-keluarga/${kk.id}`} className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Kartu Keluarga</h1>
          <p className="text-sm font-mono text-muted-foreground">No. KK: {kk.nomorKK}</p>
        </div>
      </div>

      <form action={updateAction} className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-1 text-sm">
            <label className="font-medium">Nomor Kartu Keluarga (16 Digit) <span className="text-red-500">*</span></label>
            <input
              name="nomorKK"
              type="text"
              maxLength={16}
              defaultValue={kk.nomorKK}
              className="w-full p-2 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium">RT</label>
              <input name="rt" type="text" defaultValue={kk.rt || ""} className="w-full p-2 border rounded-md text-sm" />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">RW</label>
              <input name="rw" type="text" defaultValue={kk.rw || ""} className="w-full p-2 border rounded-md text-sm" />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">Kode Pos</label>
              <input name="kodePos" type="text" defaultValue={kk.kodePos || ""} className="w-full p-2 border rounded-md text-sm" />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Alamat Lengkap <span className="text-red-500">*</span></label>
            <textarea
              name="alamat"
              rows={3}
              defaultValue={kk.alamat}
              className="w-full p-2 border rounded-md text-sm resize-none"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href={`/kartu-keluarga/${kk.id}`} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent">
            Batal
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}