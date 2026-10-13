export type PasswordState = { status: "idle" | "error" | "success"; message: string; temporaryPassword?: string };

export function passwordError(password: string) {
  if (password.length < 12) return "Password baru minimal 12 karakter.";
  if (Buffer.byteLength(password, "utf8") > 72) return "Password baru maksimal 72 byte.";
  return null;
}
