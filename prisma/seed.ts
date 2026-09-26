import { PrismaClient, Role, JenisKelamin, Agama } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  // Password default: admin123
  const hashedPassword = await hash("admin123", 10);

  // 1. Admin User
  const adminUser = await prisma.user.upsert({
    where: { nik: "3515000000000001" },
    update: {},
    create: {
      nik: "3515000000000001",
      password: hashedPassword,
      namaLengkap: "Ketua RT Admin",
      jenisKelamin: JenisKelamin.L,
      role: Role.ADMIN,
      agama: Agama.ISLAM,
    },
  });

  // 2. Jenis Pekerjaan Default
  const pekerjaanList = [
    "PNS", "Karyawan Swasta", "Wiraswasta", "Buruh",
    "Ibu Rumah Tangga", "Pelajar/Mahasiswa", "Lainnya"
  ];
  for (const p of pekerjaanList) {
    await prisma.jenisPekerjaan.upsert({
      where: { nama: p },
      update: {},
      create: { nama: p },
    });
  }

  // 3. Jenis Surat Default
  const suratList = [
    { nama: "Surat Pengantar", kodePrefix: "SP", templateHtml: "<p>Surat Pengantar RT</p>" },
    { nama: "SK Domisili", kodePrefix: "SKD", templateHtml: "<p>Surat Keterangan Domisili</p>" },
    { nama: "SK Tidak Mampu", kodePrefix: "SKTM", templateHtml: "<p>Surat Keterangan Tidak Mampu</p>" },
  ];
  for (const s of suratList) {
    await prisma.jenisSurat.upsert({
      where: { kodePrefix: s.kodePrefix },
      update: {},
      create: s,
    });
  }

  // 4. Jenis Iuran Default
  await prisma.jenisIuran.upsert({
    where: { id: "iuran-kebersihan" },
    update: {},
    create: {
      id: "iuran-kebersihan",
      nama: "Iuran Kebersihan & Keamanan",
      nominal: 50000,
      periode: "BULANAN",
    },
  });

  // 5. Konfigurasi Sistem Default
  await prisma.konfigurasiSistem.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      rt: "003",
      rw: "002",
      desa: "Sukadamai",
      kecamatan: "Cisaat",
      kabupaten: "Sukabumi",
    },
  });

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
