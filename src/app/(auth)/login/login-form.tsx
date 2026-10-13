"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Building2 } from "lucide-react";

export default function LoginForm() {
  const [loginSebagai, setLoginSebagai] = useState<"ADMIN" | "WARGA">("ADMIN");
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        nik: nik.trim(),
        password,
        loginSebagai,
        redirect: false,
      });

      if (!res?.ok || res.error) {
        setError("NIK, password, atau jenis akun tidak sesuai.");
        return;
      }

      window.location.assign("/");
    } catch {
      setError("Login gagal. Periksa koneksi server lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm bg-card border rounded-lg p-6 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Masuk ke SIM RT/RW</h1>
          <p className="text-xs text-muted-foreground">
            Pilih jenis akun, lalu masukkan NIK dan password.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2" aria-label="Jenis akun">
          {(["ADMIN", "WARGA"] as const).map((role) => (
            <button
              key={role}
              type="button"
              aria-pressed={loginSebagai === role}
              disabled={loading}
              onClick={() => {
                setLoginSebagai(role);
                setError("");
              }}
              className={`rounded-md border px-3 py-2 text-sm font-medium ${
                loginSebagai === role ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"
              }`}
            >
              {role === "ADMIN" ? "Pengurus" : "Warga"}
            </button>
          ))}
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-sm">
            <label htmlFor="login-nik" className="font-medium">NIK</label>
            <input
              id="login-nik"
              type="text"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              placeholder="3515..."
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1 text-sm">
            <label htmlFor="login-password" className="font-medium">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Memproses..." : `Masuk sebagai ${loginSebagai === "ADMIN" ? "Pengurus" : "Warga"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
