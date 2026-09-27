import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { nik: session.user.email || "" },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const iuranList = await prisma.pembayaranIuran.findMany({
    include: { warga: { include: { user: true } }, jenisIuran: true },
    orderBy: [{ tahun: "desc" }, { bulan: "desc" }],
  });

  const data = iuranList.map((i) => ({
    Tanggal: new Date(i.tanggalBayar).toLocaleDateString("id-ID"),
    NIK: i.warga.user.nik,
    Nama: i.warga.user.namaLengkap,
    "Jenis Iuran": i.jenisIuran.nama,
    Periode: `${i.bulan}/${i.tahun}`,
    "Nominal Bayar": Number(i.nominalBayar),
    Keterangan: i.keterangan || "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Iuran");

  const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"rekap-iuran.xlsx\"",
    },
  });
}
