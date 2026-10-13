"use client";

import { useRef } from "react";

export default function InitialPasswordFields() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);

  function validate() {
    const password = passwordRef.current;
    const confirmation = confirmationRef.current;
    if (!password || !confirmation) return;
    password.setCustomValidity(new TextEncoder().encode(password.value).length > 72 ? "Password maksimal 72 byte." : "");
    confirmation.setCustomValidity(confirmation.value && confirmation.value !== password.value ? "Konfirmasi password tidak cocok." : "");
  }

  return (
    <fieldset className="space-y-4 border-t pt-4">
      <legend className="font-semibold">Akses Portal Warga</legend>
      <p className="text-sm text-muted-foreground">Buat password awal minimal 12 karakter dan berikan langsung ke warga. Password ini tidak bisa dilihat lagi setelah disimpan.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1 text-sm">
          <label htmlFor="passwordAwal" className="font-medium">Password awal</label>
          <input ref={passwordRef} onInput={validate} id="passwordAwal" name="passwordAwal" type="password" minLength={12} maxLength={72} autoComplete="new-password" className="w-full p-2 border rounded-md text-sm" required />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="konfirmasiPassword" className="font-medium">Konfirmasi password</label>
          <input ref={confirmationRef} onInput={validate} id="konfirmasiPassword" name="konfirmasiPassword" type="password" minLength={12} maxLength={72} autoComplete="new-password" className="w-full p-2 border rounded-md text-sm" required />
        </div>
      </div>
    </fieldset>
  );
}
