import { createJenisSurat } from "@/lib/actions/surat";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TambahJenisSuratPage() {
  const defaultTemplate = `<div style="font-family: serif; padding: 20px;">
  <h2 style="text-align: center;">SURAT KETERANGAN {{ jenis_surat }}</h2>
  <p>Yang bertanda tangan di bawah ini Ketua RT {{ rt }}/RW {{ rw }} menerangkan bahwa:</p>
  <table style="margin-left: 20px;">
    <tr><td>Nama</td><td>: {{ nama }}</td></tr>
    <tr><td>NIK</td><td>: {{ nik }}</td></tr>
    <tr><td>Alamat</td><td>: {{ alamat }}</td></tr>
  </table>
  <p>Orang tersebut adalah benar warga kami dan memerlukan surat ini untuk keperluan: <b>{{ keperluan }}</b>.</p>
  <p>Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
</div>`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/surat" className="p-2 border rounded-md hover:bg-accent text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Jenis Surat Baru</h1>
          <p className="text-sm text-muted-foreground">Buat jenis & template HTML surat baru.</p>
        </div>
      </div>

      <form action={createJenisSurat} className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1 text-sm">
              <label className="font-medium">Nama Jenis Surat <span className="text-red-500">*</span></label>
              <input
                name="nama"
                type="text"
                placeholder="Contoh: Surat Keterangan Usaha"
                className="w-full p-2 border rounded-md text-sm"
                required
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">Kode Prefix <span className="text-red-500">*</span></label>
              <input
                name="kodePrefix"
                type="text"
                maxLength={6}
                placeholder="SKU"
                className="w-full p-2 border rounded-md text-sm font-mono uppercase"
                required
              />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <label className="font-medium">Template HTML Surat <span className="text-red-500">*</span></label>
            <textarea
              name="templateHtml"
              rows={10}
              defaultValue={defaultTemplate}
              className="w-full p-3 border rounded-md text-xs font-mono resize-y bg-muted/30"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/surat" className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent">
            Batal
          </Link>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            Simpan Jenis Surat
          </button>
        </div>
      </form>
    </div>
  );
}