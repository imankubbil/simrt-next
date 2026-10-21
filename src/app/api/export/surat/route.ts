import { NextResponse } from "next/server";
import { requireStaff, rtScopeWhere } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireStaff().catch(() => null);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const suratList = await prisma.surat.findMany({
    where: { wilayahRt: { is: rtScopeWhere(access) } },
    include: { warga: { include: { user: true } }, jenisSurat: true },
    orderBy: { tanggal: "desc" },
  });

  const data = suratList.map((s) => ({
    Tanggal: new Date(s.tanggal).toLocaleDateString("id-ID"),
    "Nomor Surat": s.nomorSurat,
    "Jenis Surat": s.jenisSurat.nama,
    NIK: s.warga.user.nik,
    "Nama Pemohon": s.warga.user.namaLengkap,
    Keperluan: s.keperluan,
    Status: s.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Log Surat");

  const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"log-surat.xlsx\"",
    },
  });
}
