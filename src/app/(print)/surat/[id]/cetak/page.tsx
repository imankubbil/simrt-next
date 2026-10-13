import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatTanggal } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";

export default async function CetakSuratPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const surat = await prisma.surat.findUnique({
    where: { id: params.id },
    include: {
      jenisSurat: true,
      warga: { include: { user: true, jenisPekerjaan: true } },
    },
  });
  if (!surat) notFound();
  const bolehLihat = session.user.role === "ADMIN" || (
    session.user.role === "WARGA" &&
    surat.warga.userId === session.user.id &&
    surat.status === "SELESAI"
  );
  if (!bolehLihat) notFound();

  const sistem = await prisma.konfigurasiSistem.findUnique({ where: { id: "singleton" } });
  const ketuaRt = sistem?.ketuaRtId
    ? await prisma.warga.findUnique({ where: { id: sistem.ketuaRtId }, include: { user: true } })
    : null;
  const ketuaRw = sistem?.ketuaRwId
    ? await prisma.warga.findUnique({ where: { id: sistem.ketuaRwId }, include: { user: true } })
    : null;

  return (
    <div className="p-12 max-w-3xl mx-auto bg-white text-black font-serif print:p-0 print:max-w-none">
      <div className="text-center border-b-2 border-black pb-4 mb-8">
        <h3 className="font-bold text-sm tracking-widest uppercase">PEMERINTAH KABUPATEN {sistem?.kabupaten || "..."}</h3>
        <h3 className="font-bold text-sm tracking-widest uppercase">KECAMATAN {sistem?.kecamatan || "..."} DESA {sistem?.desa || "..."}</h3>
        <h2 className="font-bold text-lg mt-1 tracking-wider">RUKUN TETANGGA {sistem?.rt || "..."} RUKUN WARGA {sistem?.rw || "..."}</h2>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-xl font-bold underline uppercase">{surat.jenisSurat.nama}</h1>
        <p className="text-sm font-mono mt-1">Nomor: {surat.nomorSurat}</p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed mb-8">
        <p>Yang bertanda tangan di bawah ini Ketua RT {sistem?.rt || "..."} / RW {sistem?.rw || "..."} Desa {sistem?.desa || "..."}, Kecamatan {sistem?.kecamatan || "..."}, Kabupaten {sistem?.kabupaten || "..."}, menerangkan bahwa:</p>

        <table className="w-full text-sm ml-4 border-separate space-y-1">
          <tbody>
            <tr><td className="w-40 font-semibold">Nama Lengkap</td><td>: {surat.warga.user.namaLengkap}</td></tr>
            <tr><td className="font-semibold">NIK</td><td>: {surat.warga.user.nik}</td></tr>
            <tr><td className="font-semibold">Jenis Kelamin</td><td>: {surat.warga.user.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</td></tr>
            <tr><td className="font-semibold">Tempat/Tgl Lahir</td><td>: {surat.warga.user.tempatLahir || "-"}, {surat.warga.user.tanggalLahir ? formatTanggal(new Date(surat.warga.user.tanggalLahir)) : "-"}</td></tr>
            <tr><td className="font-semibold">Agama</td><td>: {surat.warga.user.agama}</td></tr>
            <tr><td className="font-semibold">Pekerjaan</td><td>: {surat.warga.jenisPekerjaan?.nama || "-"}</td></tr>
            <tr><td className="font-semibold">Alamat</td><td>: {surat.warga.alamat || "-"}</td></tr>
          </tbody>
        </table>

        <p>Orang tersebut di atas adalah benar-benar warga RT {sistem?.rt || "..."} / RW {sistem?.rw || "..."} kami dan bermaksud mengurus surat keterangan ini untuk keperluan: <b>{surat.keperluan}</b>.</p>

        <p>Demikian Surat Keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
      </div>

      <div className="flex justify-between text-xs mt-16 px-8">
        <div className="text-center">
          <p>Ketua RW {sistem?.rw || "..."}</p>
          <div className="h-20 flex items-center justify-center">
            {sistem?.ttdKetuaRw && <Image src={sistem.ttdKetuaRw} alt="Tanda tangan Ketua RW" width={160} height={64} unoptimized loading="eager" className="max-h-16 max-w-40 object-contain" />}
          </div>
          <p className="font-bold underline">{ketuaRw?.user.namaLengkap || "( ........................................ )"}</p>
        </div>
        <div className="text-center">
          <p>{sistem?.desa || "Sukadamai"}, {formatTanggal(new Date(surat.tanggal))}</p>
          <p>Ketua RT {sistem?.rt || "..."}</p>
          <div className="h-16 flex items-center justify-center">
            {sistem?.ttdKetuaRt && <Image src={sistem.ttdKetuaRt} alt="Tanda tangan Ketua RT" width={160} height={64} unoptimized loading="eager" className="max-h-16 max-w-40 object-contain" />}
          </div>
          <p className="font-bold underline">{ketuaRt?.user.namaLengkap || "( ........................................ )"}</p>
        </div>
      </div>
    </div>
  );
}
