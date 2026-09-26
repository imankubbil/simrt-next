import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatTanggal } from "@/lib/utils";

export default async function CetakKKPage({ params }: { params: { id: string } }) {
  const kk = await prisma.kartuKeluarga.findUnique({
    where: { id: params.id },
    include: {
      anggota: {
        include: { warga: { include: { user: true, jenisPekerjaan: true } } },
        orderBy: { tanggalMasuk: "asc" },
      },
    },
  });

  const sistem = await prisma.konfigurasiSistem.findUnique({ where: { id: "singleton" } });
  if (!kk) notFound();

  const kepala = kk.anggota.find((a) => a.hubungan === "KEPALA_KELUARGA");

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-black font-serif print:p-0">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-wider">KARTU KELUARGA</h1>
        <p className="text-lg font-mono font-bold mt-1">No. {kk.nomorKK}</p>
      </div>

      <div className="grid grid-cols-2 text-xs mb-6 gap-y-1">
        <div>
          <span className="inline-block w-32 font-semibold">Nama Kepala Keluarga</span>: {kepala ? kepala.warga.user.namaLengkap : "-"}
        </div>
        <div>
          <span className="inline-block w-32 font-semibold">Desa/Kelurahan</span>: {sistem?.desa || "-"}
        </div>
        <div>
          <span className="inline-block w-32 font-semibold">Alamat</span>: {kk.alamat}
        </div>
        <div>
          <span className="inline-block w-32 font-semibold">Kecamatan</span>: {sistem?.kecamatan || "-"}
        </div>
        <div>
          <span className="inline-block w-32 font-semibold">RT/RW</span>: {kk.rt || "-"}/{kk.rw || "-"}
        </div>
        <div>
          <span className="inline-block w-32 font-semibold">Kabupaten/Kota</span>: {sistem?.kabupaten || "-"}
        </div>
        <div>
          <span className="inline-block w-32 font-semibold">Kode Pos</span>: {kk.kodePos || "-"}
        </div>
        <div>
          <span className="inline-block w-32 font-semibold">Provinsi</span>: Jawa Barat
        </div>
      </div>

      <table className="w-full border-collapse border border-black text-xs text-center mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1.5">No</th>
            <th className="border border-black p-1.5">Nama Lengkap</th>
            <th className="border border-black p-1.5">NIK</th>
            <th className="border border-black p-1.5">JK</th>
            <th className="border border-black p-1.5">Tempat Lahir</th>
            <th className="border border-black p-1.5">Tgl Lahir</th>
            <th className="border border-black p-1.5">Agama</th>
            <th className="border border-black p-1.5">Pekerjaan</th>
            <th className="border border-black p-1.5">Hubungan</th>
          </tr>
        </thead>
        <tbody>
          {kk.anggota.map((a, idx) => (
            <tr key={a.id}>
              <td className="border border-black p-1.5">{idx + 1}</td>
              <td className="border border-black p-1.5 text-left font-semibold">{a.warga.user.namaLengkap}</td>
              <td className="border border-black p-1.5 font-mono">{a.warga.user.nik}</td>
              <td className="border border-black p-1.5">{a.warga.user.jenisKelamin}</td>
              <td className="border border-black p-1.5">{a.warga.user.tempatLahir || "-"}</td>
              <td className="border border-black p-1.5">{a.warga.user.tanggalLahir ? formatTanggal(new Date(a.warga.user.tanggalLahir)) : "-"}</td>
              <td className="border border-black p-1.5">{a.warga.user.agama}</td>
              <td className="border border-black p-1.5">{a.warga.jenisPekerjaan?.nama || "-"}</td>
              <td className="border border-black p-1.5 font-semibold">{a.hubungan.replace("_", " ")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between text-xs mt-12 px-8">
        <div className="text-center">
          <p>Ketua RT {kk.rt || "..."}</p>
          <div className="h-16"></div>
          <p className="font-bold underline">( ........................................ )</p>
        </div>
        <div className="text-center">
          <p>Kepala Keluarga</p>
          <div className="h-16"></div>
          <p className="font-bold underline">{kepala ? kepala.warga.user.namaLengkap : "( ........................................ )"}</p>
        </div>
      </div>
    </div>
  );
}