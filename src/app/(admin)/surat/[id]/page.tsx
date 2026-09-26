import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Trash2 } from "lucide-react";
import { deleteSurat } from "@/lib/actions/surat";
import { formatTanggal } from "@/lib/utils";

export default async function DetailSuratPage({ params }: { params: { id: string } }) {
  const surat = await prisma.surat.findUnique({
    where: { id: params.id },
    include: {
      jenisSurat: true,
      warga: { include: { user: true, jenisPekerjaan: true } },
      createdBy: true,
    },
  });

  if (!surat) notFound();

  const deleteAction = deleteSurat.bind(null, surat.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/surat" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">{surat.nomorSurat}</h1>
            <p className="text-sm text-muted-foreground">{surat.jenisSurat.nama}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/surat/${surat.id}/cetak`} target="_blank" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Printer className="w-4 h-4" /> Cetak PDF
          </Link>
          <form action={deleteAction}>
            <button type="submit" className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Hapus
            </button>
          </form>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-6 shadow-sm text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-muted-foreground text-xs block">Pemohon</span>
            <span className="font-semibold text-base">{surat.warga.user.namaLengkap}</span>
            <span className="text-xs font-mono text-muted-foreground block">NIK: {surat.warga.user.nik}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Tanggal Diterbitkan</span>
            <span className="font-medium">{formatTanggal(new Date(surat.tanggal))}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <span className="text-muted-foreground text-xs block mb-1">Keperluan</span>
          <p className="font-medium bg-muted/40 p-3 rounded-md">{surat.keperluan}</p>
        </div>
      </div>
    </div>
  );
}