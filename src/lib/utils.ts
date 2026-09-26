import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function hitungUsia(tanggalLahir: Date): number {
  const today = new Date();
  let usia = today.getFullYear() - tanggalLahir.getFullYear();
  const m = today.getMonth() - tanggalLahir.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < tanggalLahir.getDate())) {
    usia--;
  }
  return usia;
}

const BULAN_ROMAWI = [
  "", "I", "II", "III", "IV", "V", "VI",
  "VII", "VIII", "IX", "X", "XI", "XII",
];

export function generateNomorSurat(
  counter: number,
  kodePrefix: string,
  rt: string = "000"
): string {
  const now = new Date();
  const bulan = BULAN_ROMAWI[now.getMonth() + 1];
  return `${String(counter).padStart(3, "0")}/${kodePrefix}/RT.${rt}/${bulan}/${now.getFullYear()}`;
}
