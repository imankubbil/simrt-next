import { z } from "zod";

export const wargaSchema = z.object({
  nik: z.string().length(16, "NIK harus 16 digit").regex(/^\d+$/, "NIK harus berupa angka"),
  namaLengkap: z.string().min(1, "Nama wajib diisi"),
  jenisKelamin: z.enum(["L", "P"]),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  agama: z.enum(["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDHA", "KONGHUCU"]),
  jenisPekerjaanId: z.string().optional(),
  kewarganegaraan: z.enum(["WNI", "WNA"]).default("WNI"),
  namaAyah: z.string().optional(),
  namaIbu: z.string().optional(),
  alamat: z.string().optional(),
});

export const wargaUpdateSchema = wargaSchema.omit({ nik: true });

export const kartuKeluargaSchema = z.object({
  nomorKK: z.string().length(16, "Nomor KK harus 16 digit").regex(/^\d+$/, "Harus angka"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  rt: z.string().optional(),
  rw: z.string().optional(),
  kodePos: z.string().optional(),
  anggota: z.array(z.object({
    wargaId: z.string(),
    hubungan: z.string(),
  })).min(1, "Minimal 1 anggota"),
});

export const suratSchema = z.object({
  jenisSuratId: z.string().min(1, "Jenis surat wajib dipilih"),
  wargaId: z.string().min(1, "Warga wajib dipilih"),
  keperluan: z.string().min(1, "Keperluan wajib diisi"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
});

export const pengajuanSuratSchema = z.object({
  jenisSuratId: z.string().min(1, "Jenis surat wajib dipilih"),
  keperluan: z.string().trim().min(1, "Keperluan wajib diisi"),
});

export const iuranSchema = z.object({
  wargaId: z.string().min(1),
  jenisIuranId: z.string().min(1),
  bulan: z.coerce.number().int().min(1).max(12),
  tahun: z.coerce.number().int().min(2020),
  nominalBayar: z.coerce.number().min(0),
  tanggalBayar: z.string().min(1),
});
