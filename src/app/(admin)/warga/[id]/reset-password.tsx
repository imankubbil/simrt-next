"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { resetWargaPassword } from "@/lib/actions/password";
import type { PasswordState } from "@/lib/password";

const initialState: PasswordState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50">{pending ? "Mereset..." : "Ya, reset password"}</button>;
}

export default function ResetPasswordWarga({ wargaId }: { wargaId: string }) {
  const [state, formAction] = useFormState(resetWargaPassword.bind(null, wargaId), initialState);
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="space-y-3 rounded-lg border bg-card p-5 shadow-sm">
      <h2 className="font-semibold">Akses Portal Warga</h2>
      <p className="text-sm text-muted-foreground">Gunakan reset jika warga lupa password. Password lama langsung tidak berlaku; sesi login lama juga akan berakhir.</p>
      {state.status !== "success" && (confirming ? (
        <form action={formAction} className="space-y-3 rounded-md border p-3">
          <p className="text-sm font-medium">Yakin reset password warga ini?</p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" required className="mt-1" />
            <span>Saya paham password lama dan sesi login warga akan berhenti berlaku.</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setConfirming(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Batal</button>
            <SubmitButton />
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">Reset password warga</button>
      ))}
      {state.message && <p role="status" className={`text-sm ${state.status === "error" ? "text-red-700" : "text-green-700"}`}>{state.message}</p>}
      {state.temporaryPassword && (
        <div className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
          <p className="font-medium">Password sementara (tampil sekali)</p>
          <output className="block break-all select-all rounded border bg-background p-2 font-mono">{state.temporaryPassword}</output>
          <p className="text-muted-foreground">Sampaikan langsung ke warga. Minta warga menggantinya setelah masuk; password ini tidak bisa dilihat lagi setelah halaman dimuat ulang.</p>
        </div>
      )}
    </section>
  );
}
