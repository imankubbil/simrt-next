import { FileSpreadsheet, Users, CreditCard, FileText, Download } from "lucide-react";

export default function LaporanPage() {
  const REPORTS = [
    {
      title: "Export Data Warga",
      description: "Unduh seluruh data kependudukan (NIK, Nama, Gender, Pekerjaan, Alamat, Status) format Excel.",
      icon: Users,
      color: "text-blue-500",
      downloadUrl: "/api/export/warga",
      fileName: "data-warga.xlsx",
    },
    {
      title: "Export Rekap Pembayaran Iuran",
      description: "Unduh seluruh riwayat penerimaan iuran bulanan dan tahunan warga format Excel.",
      icon: CreditCard,
      color: "text-green-500",
      downloadUrl: "/api/export/iuran",
      fileName: "rekap-iuran.xlsx",
    },
    {
      title: "Export Log Layanan Surat",
      description: "Unduh seluruh rekam jejak surat keterangan/pengantar yang diterbitkan RT format Excel.",
      icon: FileText,
      color: "text-orange-500",
      downloadUrl: "/api/export/surat",
      fileName: "log-surat.xlsx",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan & Export Excel</h1>
        <p className="text-muted-foreground text-sm mt-1">Unduh rekapitulasi data SIMRT dalam format file spreadsheet Excel (.xlsx).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.title} className="bg-card border rounded-lg p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className={`p-3 bg-muted rounded-full w-fit ${report.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold">{report.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">{report.description}</p>
              </div>

              <a
                href={report.downloadUrl}
                download={report.fileName}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Unduh Excel (.xlsx)
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

