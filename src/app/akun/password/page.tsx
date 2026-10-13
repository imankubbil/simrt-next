import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PasswordForm from "./password-form";

export default async function PasswordPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) redirect("/login");

  return (
    <main className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="mx-auto max-w-md space-y-6">
        <Link href={session.user.role === "ADMIN" ? "/dashboard" : "/portal/profil"} className="text-sm font-medium text-primary hover:underline">Kembali</Link>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Ganti password</h1>
          <p className="text-sm text-muted-foreground">Masukkan password saat ini, lalu pilih password baru. Setelah berhasil, Anda perlu masuk ulang.</p>
        </div>
        <PasswordForm />
      </div>
    </main>
  );
}
