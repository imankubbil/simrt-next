import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { buatAkunPengurus, simpanTtdRt, simpanTtdRw, simpanWilayahRt, simpanWilayahRw, ubahPenugasanPengurus } from "@/lib/actions/wilayah";
import { redirect } from "next/navigation";

export default async function WilayahPage({ searchParams }: { searchParams: { tersimpan?: string } }) {
  const access = await requireStaff();
  if (access.role === "PENGURUS_RT") redirect("/dashboard");
  const admin = access.role === "ADMIN";
  const [rwList, rtList, pengurusList] = await Promise.all([
    prisma.wilayahRw.findMany({ where: admin ? {} : { id: access.wilayahRwId! }, include: { ketuaRw: true, _count: { select: { rtList: true } } }, orderBy: { nomor: "asc" } }),
    prisma.wilayahRt.findMany({ where: admin ? {} : { rwId: access.wilayahRwId! }, include: { rw: true, ketuaRt: true }, orderBy: [{ rw: { nomor: "asc" } }, { nomor: "asc" }] }),
    prisma.user.findMany({
      where: admin ? { role: { in: ["PENGURUS_RW", "PENGURUS_RT"] } } : { role: "PENGURUS_RT", penugasanRt: { is: { rwId: access.wilayahRwId! } } },
      include: { penugasanRw: true, penugasanRt: { include: { rw: true } }, ketuaRwUntuk: true, ketuaRtUntuk: true },
      orderBy: { namaLengkap: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <Link href={admin ? "/pengaturan" : "/dashboard"} className="text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{admin ? "Kembali ke pengaturan" : "Kembali ke beranda"}</Link>
        <h1 className="text-3xl font-bold tracking-tight">{admin ? "Wilayah dan Pengurus" : `Pengurus RT di RW ${rwList[0]?.nomor || "tugas"}`}</h1>
        <p className="text-sm text-muted-foreground">{admin ? "Atur RW, RT, serta satu wilayah tugas untuk setiap akun pengurus." : "Kelola akun dan penugasan pengurus RT di RW yang ditugaskan kepada Anda."}</p>
      </header>

      {searchParams.tersimpan === "1" && <p role="status" className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">Perubahan berhasil disimpan.</p>}

      {!admin && rwList.map((rw) => <section key={rw.id} className="space-y-3 border-t pt-6">
        <div>
          <h2 className="text-xl font-semibold">Tanda tangan Ketua RW {rw.nomor}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pengaturan ini hanya berlaku untuk RW tugas Anda.</p>
        </div>
        {rw.ketuaRwId === access.userId ? <form action={simpanTtdRw.bind(null, rw.id)} className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
          {rw.ttdKetuaRw && <Image src={rw.ttdKetuaRw} alt={`Tanda tangan Ketua RW ${rw.nomor}`} width={120} height={48} unoptimized className="h-12 w-28 object-contain" />}
          <div className="min-w-0 flex-1 space-y-1">
            <label htmlFor={`ttd-rw-pengurus-${rw.id}`} className="text-sm font-medium">Unggah gambar tanda tangan</label>
            <input id={`ttd-rw-pengurus-${rw.id}`} name="ttd" type="file" accept="image/png,image/jpeg" className="block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-md file:border file:bg-background file:px-3 file:font-medium" />
            {rw.ttdKetuaRw && <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="hapusTtd" className="h-4 w-4 accent-primary" /> Hapus tanda tangan</label>}
          </div>
          <button className="min-h-11 rounded-md border bg-background px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Simpan TTD RW</button>
        </form> : <p className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
          {rw.ketuaRw ? `Tanda tangan hanya dapat dikelola oleh Ketua RW yang ditetapkan (${rw.ketuaRw.namaLengkap}).` : "Admin perlu menetapkan Ketua RW sebelum tanda tangan dapat dikelola."}
        </p>}
      </section>)}

      {admin && <section className="space-y-4">
        <h2 className="text-xl font-semibold">Unit wilayah</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <form action={simpanWilayahRw} className="space-y-3 rounded-lg border bg-card p-5">
            <h3 className="font-medium">Tambah RW</h3>
            <label htmlFor="nomor-rw" className="block text-sm font-medium">Nomor RW</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="nomor-rw" name="nomor" placeholder="Contoh: 003" maxLength={20} required className="min-h-11 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              <button className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Simpan RW</button>
            </div>
          </form>

          <form action={simpanWilayahRt} className="space-y-3 rounded-lg border bg-card p-5">
            <h3 className="font-medium">Tambah RT</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="nomor-rt" className="block text-sm font-medium">Nomor RT</label>
                <input id="nomor-rt" name="nomor" placeholder="Contoh: 005" maxLength={20} required className="min-h-11 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              </div>
              <div className="space-y-1">
                <label htmlFor="rw-id" className="block text-sm font-medium">Di bawah RW</label>
                <select id="rw-id" name="rwId" required defaultValue="" className="min-h-11 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <option value="" disabled>-- Pilih RW --</option>
                  {rwList.map((rw) => <option key={rw.id} value={rw.id}>RW {rw.nomor}</option>)}
                </select>
              </div>
            </div>
            <button disabled={!rwList.length} className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Simpan RT</button>
            {!rwList.length && <p className="text-sm text-muted-foreground">Buat RW dulu sebelum menambahkan RT.</p>}
          </form>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b p-4 font-medium">Daftar RW dan tanda tangan Ketua RW</div>
          {rwList.length ? <ul className="divide-y">
            {rwList.map((rw) => <li key={rw.id} className="space-y-3 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">RW {rw.nomor} <span className="font-normal text-muted-foreground">({rw._count.rtList} RT)</span></span>
                <span className="text-sm text-muted-foreground">Ketua RW: {rw.ketuaRw?.namaLengkap || "Belum ditetapkan"}</span>
              </div>
              <form action={simpanTtdRw.bind(null, rw.id)} className="flex flex-col gap-3 rounded-md bg-muted/40 p-3 sm:flex-row sm:items-center">
                {rw.ttdKetuaRw && <Image src={rw.ttdKetuaRw} alt={`Tanda tangan Ketua RW ${rw.nomor}`} width={120} height={48} unoptimized className="h-12 w-28 object-contain" />}
                <div className="min-w-0 flex-1 space-y-1">
                  <label htmlFor={`ttd-rw-${rw.id}`} className="text-sm font-medium">Tanda tangan Ketua RW</label>
                  <input id={`ttd-rw-${rw.id}`} name="ttd" type="file" accept="image/png,image/jpeg" className="block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-md file:border file:bg-background file:px-3 file:font-medium" />
                  {rw.ttdKetuaRw && <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="hapusTtd" className="h-4 w-4 accent-primary" /> Hapus tanda tangan</label>}
                </div>
                <button className="min-h-11 rounded-md border bg-background px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Simpan TTD</button>
              </form>
            </li>)}
          </ul> : <p className="p-5 text-sm text-muted-foreground">Belum ada RW untuk diatur.</p>}
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b p-4 font-medium">Daftar wilayah</div>
          {rtList.length ? <ul className="divide-y">
            {rtList.map((rt) => <li key={rt.id} className="space-y-3 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">RT {rt.nomor} / RW {rt.rw.nomor}</span>
                <span className="text-sm text-muted-foreground">Ketua RT: {rt.ketuaRt?.namaLengkap || "Belum ditetapkan"}</span>
              </div>
              <form action={simpanTtdRt.bind(null, rt.id)} className="flex flex-col gap-3 rounded-md bg-muted/40 p-3 sm:flex-row sm:items-center">
                {rt.ttdKetuaRt && <Image src={rt.ttdKetuaRt} alt={`Tanda tangan Ketua RT ${rt.nomor}`} width={120} height={48} unoptimized className="h-12 w-28 object-contain" />}
                <div className="min-w-0 flex-1 space-y-1">
                  <label htmlFor={`ttd-rt-${rt.id}`} className="text-sm font-medium">Tanda tangan Ketua RT</label>
                  <input id={`ttd-rt-${rt.id}`} name="ttd" type="file" accept="image/png,image/jpeg" className="block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-md file:border file:bg-background file:px-3 file:font-medium" />
                  {rt.ttdKetuaRt && <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="hapusTtd" className="h-4 w-4 accent-primary" /> Hapus tanda tangan</label>}
                </div>
                <button className="min-h-11 rounded-md border bg-background px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Simpan TTD</button>
              </form>
            </li>)}
          </ul> : <p className="p-5 text-sm text-muted-foreground">Belum ada RT. Tambahkan RW dan RT untuk mulai menetapkan wilayah.</p>}
        </div>
      </section>}

      <section className="space-y-4 border-t pt-6">
        <div>
          <h2 className="text-xl font-semibold">Akun Pengurus</h2>
          <p className="mt-1 text-sm text-muted-foreground">Akun baru tidak terhubung ke data warga. Sampaikan password awal secara aman kepada pemilik akun. {admin ? "" : `Akun ini akan ditempatkan di RW ${rwList[0]?.nomor || "tugas"}.`}</p>
        </div>
        <form action={buatAkunPengurus} className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="nama-pengurus" className="text-sm font-medium">Nama lengkap</label>
            <input id="nama-pengurus" name="namaLengkap" autoComplete="name" required className="min-h-11 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div className="space-y-1">
            <label htmlFor="nik-pengurus" className="text-sm font-medium">NIK</label>
            <input id="nik-pengurus" name="nik" inputMode="numeric" autoComplete="off" minLength={16} maxLength={16} pattern="[0-9]{16}" required className="min-h-11 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div className="space-y-1">
            <label htmlFor="password-pengurus" className="text-sm font-medium">Password awal</label>
            <input id="password-pengurus" name="password" type="password" autoComplete="new-password" minLength={12} required className="min-h-11 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div className="space-y-1">
            <label htmlFor="wilayah-pengurus" className="text-sm font-medium">Penugasan</label>
            <select id="wilayah-pengurus" name="wilayah" required defaultValue="" className="min-h-11 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="" disabled>-- Pilih RT atau RW --</option>
              {admin && rwList.map((rw) => <option key={`rw-${rw.id}`} value={`RW:${rw.id}`}>Pengurus RW {rw.nomor}</option>)}
              {rtList.map((rt) => <option key={`rt-${rt.id}`} value={`RT:${rt.id}`}>Pengurus RT {rt.nomor} / RW {rt.rw.nomor}</option>)}
            </select>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="ketua" className="h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            Tetapkan sebagai Ketua untuk wilayah tersebut
          </label>
          <div className="md:col-span-2">
            <button disabled={!rwList.length && !rtList.length} className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Buat akun pengurus</button>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b p-4 font-medium">Penugasan aktif</div>
          {pengurusList.length ? <div className="divide-y">
            {pengurusList.map((user) => {
              const current = user.role === "PENGURUS_RW" && user.wilayahRwId
                ? `RW:${user.wilayahRwId}`
                : user.role === "PENGURUS_RT" && user.wilayahRtId ? `RT:${user.wilayahRtId}` : "";
              const isKetua = user.ketuaRwUntuk.length > 0 || user.ketuaRtUntuk.length > 0;
              const updateAction = ubahPenugasanPengurus.bind(null, user.id);
              return <form action={updateAction} key={user.id} className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <div>
                  <p className="font-medium">{user.namaLengkap}</p>
                  <p className="text-sm text-muted-foreground">{user.nik} · {user.role === "PENGURUS_RW" ? `Pengurus RW ${user.penugasanRw?.nomor || ""}` : `Pengurus RT ${user.penugasanRt?.nomor || ""} / RW ${user.penugasanRt?.rw.nomor || ""}`}</p>
                </div>
                <div className="space-y-1">
                  <label htmlFor={`wilayah-${user.id}`} className="text-sm font-medium">Wilayah tugas</label>
                  <select id={`wilayah-${user.id}`} name="wilayah" required defaultValue={current} className="min-h-11 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option value="" disabled>-- Pilih wilayah --</option>
                    {admin && rwList.map((rw) => <option key={`rw-${rw.id}`} value={`RW:${rw.id}`}>RW {rw.nomor}</option>)}
                    {rtList.map((rt) => <option key={`rt-${rt.id}`} value={`RT:${rt.id}`}>RT {rt.nomor} / RW {rt.rw.nomor}</option>)}
                  </select>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input type="checkbox" name="ketua" defaultChecked={isKetua} className="h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                    Ketua wilayah
                  </label>
                </div>
                <button className="min-h-11 rounded-md border px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Perbarui tugas</button>
              </form>;
            })}
          </div> : <p className="p-5 text-sm text-muted-foreground">Belum ada akun pengurus. Buat akun di atas untuk mengisi daftar ini.</p>}
        </div>
      </section>
    </div>
  );
}
