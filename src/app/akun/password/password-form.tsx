"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signOut } from "next-auth/react";
import { changePassword } from "@/lib/actions/password";
import type { PasswordState } from "@/lib/password";

const initialState: PasswordState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{pending ? "Menyimpan..." : "Simpan password baru"}</button>;
}

export default function PasswordForm() {
  const [state, formAction] = useFormState(changePassword, initialState);

  useEffect(() => {
    if (state.status === "success") void signOut({ callbackUrl: "/login" });
  }, [state.status]);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
      <div className="space-y-1 text-sm">
        <label htmlFor="currentPassword" className="font-medium">Password saat ini</label>
        <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" className="w-full rounded-md border p-2.5" required />
      </div>
      <div className="space-y-1 text-sm">
        <label htmlFor="newPassword" className="font-medium">Password baru</label>
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={72} aria-describedby="passwordHint" className="w-full rounded-md border p-2.5" required />
        <p id="passwordHint" className="text-xs text-muted-foreground">Minimal 12 karakter. Gunakan password yang belum pernah dipakai.</p>
      </div>
      <div className="space-y-1 text-sm">
        <label htmlFor="confirmation" className="font-medium">Konfirmasi password baru</label>
        <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={72} className="w-full rounded-md border p-2.5" required />
      </div>
      {state.message && <p role="status" className={`rounded-md border p-3 text-sm ${state.status === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>{state.message}</p>}
      <SubmitButton />
    </form>
  );
}
