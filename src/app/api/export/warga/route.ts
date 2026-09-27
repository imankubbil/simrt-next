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

  const wargaList = await prisma.warga.findMany({
    include: { user: true, jenisPekerjaan: true },
    orderBy: { user: { namaLengkap: "asc" } },
  });

  const data = wargaList.map((w) => ({
    NIK: w.user.nik,
    "Nama Lengkap": w.user.namaLengkap,
    "Jenis Kelamin": w.user.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
    Agama: w.user.agama,
    Pekerjaan: w.jenisPekerjaan?.nama || "-",
    Kewarganegaraan: w.kewarganegaraan,
    Alamat: w.alamat || "-",
    Status: w.statusAktif ? "Aktif" : "Tidak Aktif",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Warga");

  const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"data-warga.xlsx\"",
    },
  });
}
