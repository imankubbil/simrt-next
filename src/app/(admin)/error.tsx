"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-3 text-center">
      <h2 className="text-lg font-semibold">Data admin gagal dimuat</h2>
      <p className="text-sm text-muted-foreground">Coba muat ulang halaman. Jika tetap gagal, periksa koneksi database.</p>
      <button onClick={() => reset()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Coba lagi
      </button>
    </div>
  );
}
