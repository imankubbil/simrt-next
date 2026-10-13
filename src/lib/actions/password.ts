"use server";

import { randomBytes } from "crypto";
import { compare, hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions, requireAdmin } from "@/lib/auth";
import { passwordError, type PasswordState } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function changePassword(_state: PasswordState, formData: FormData): Promise<PasswordState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) return { status: "error", message: "Sesi berakhir. Silakan masuk lagi." };

  const currentPassword = formData.get("currentPassword")?.toString() || "";
  const newPassword = formData.get("newPassword")?.toString() || "";
  const confirmation = formData.get("confirmation")?.toString() || "";
  if (!currentPassword) return { status: "error", message: "Password saat ini wajib diisi." };
  const error = passwordError(newPassword);
  if (error) return { status: "error", message: error };
  if (newPassword !== confirmation) return { status: "error", message: "Konfirmasi password tidak cocok." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
  if (!user || !(await compare(currentPassword, user.password))) {
    return { status: "error", message: "Password saat ini salah." };
  }
  if (await compare(newPassword, user.password)) {
    return { status: "error", message: "Password baru harus berbeda dari password saat ini." };
  }

  const result = await prisma.user.updateMany({
    where: { id: session.user.id, password: user.password },
    data: { password: await hash(newPassword, 10) },
  });
  if (!result.count) return { status: "error", message: "Password sudah berubah di sesi lain. Silakan masuk ulang." };
  return { status: "success", message: "Password berhasil diganti. Silakan masuk lagi dengan password baru." };
}

export async function resetWargaPassword(wargaId: string, _state: PasswordState, _formData: FormData): Promise<PasswordState> {
  await requireAdmin();
  const warga = await prisma.warga.findUnique({
    where: { id: wargaId },
    select: { userId: true, user: { select: { role: true } } },
  });
  if (!warga || warga.user.role !== "WARGA") return { status: "error", message: "Akun warga tidak ditemukan." };

  const temporaryPassword = randomBytes(18).toString("base64url");
  await prisma.user.update({
    where: { id: warga.userId },
    data: { password: await hash(temporaryPassword, 10) },
  });
  return { status: "success", message: "Password warga berhasil direset.", temporaryPassword };
}
