import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export type StaffAccess = {
  userId: string;
  role: Exclude<Role, "WARGA">;
  wilayahRwId: string | null;
  wilayahRtId: string | null;
};

export function hasValidStaffAssignment(user: { role: Role; wilayahRwId: string | null; wilayahRtId: string | null }) {
  if (user.role === "PENGURUS_RW") return !!user.wilayahRwId && !user.wilayahRtId;
  if (user.role === "PENGURUS_RT") return !!user.wilayahRtId && !user.wilayahRwId;
  return true;
}

export function canManageRwSettings(access: StaffAccess, wilayahRwId: string, ketuaRwId: string | null) {
  return access.role === "ADMIN" || (
    access.role === "PENGURUS_RW" && access.wilayahRwId === wilayahRwId && access.userId === ketuaRwId
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "NIK",
      credentials: {
        nik: { label: "NIK", type: "text" },
        password: { label: "Password", type: "password" },
        loginSebagai: { label: "Jenis Akun", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.nik || !credentials?.password) return null;
        const nik = credentials.nik.trim();

        const user = await prisma.user.findUnique({
          where: { nik },
          include: { warga: true },
        });
        if (!user) return null;
        const loginSebagai = credentials.loginSebagai;
        if (loginSebagai !== "PENGURUS" && loginSebagai !== "WARGA") return null;
        if (loginSebagai === "PENGURUS" && user.role === "WARGA") return null;
        if (loginSebagai === "WARGA" && user.role !== "WARGA") return null;
        if (!hasValidStaffAssignment(user)) return null;

        const valid = await compare(credentials.password, user.password);
        if (!valid) return null;
        if (user.role === "WARGA" && !user.warga?.statusAktif) return null;

        return {
          id: user.id,
          name: user.namaLengkap,
          email: user.nik,
          role: user.role,
          credentialVersion: createHash("sha256").update(user.password).digest("hex"),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.credentialVersion = user.credentialVersion;
      } else if (token.id) {
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { password: true, role: true, wilayahRwId: true, wilayahRtId: true, warga: { select: { statusAktif: true } } },
        });
        const version = currentUser && createHash("sha256").update(currentUser.password).digest("hex");
        if (
          !currentUser || version !== token.credentialVersion || currentUser.role !== token.role ||
          !hasValidStaffAssignment(currentUser) ||
          (currentUser.role === "WARGA" && !currentUser.warga?.statusAktif)
        ) {
          delete token.id;
          delete token.role;
          delete token.credentialVersion;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role && token.id) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

export async function requireAdmin() {
  const access = await requireStaff();
  if (access.role !== "ADMIN") redirect("/dashboard");
  return { user: { id: access.userId, role: access.role } };
}

export async function requireStaff(): Promise<StaffAccess> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, wilayahRwId: true, wilayahRtId: true },
  });
  if (!user) redirect("/login");
  if (user.role === "WARGA") redirect("/portal");
  if (!hasValidStaffAssignment(user)) redirect("/login?error=wilayah");

  return { userId: user.id, role: user.role, wilayahRwId: user.wilayahRwId, wilayahRtId: user.wilayahRtId };
}

export async function requireRtStaff() {
  const access = await requireStaff();
  if (access.role === "PENGURUS_RW") throw new Error("Pengurus RW hanya dapat membaca data operasional.");
  return access;
}

export function rtScopeWhere(access: StaffAccess) {
  if (access.role === "ADMIN") return {};
  if (access.role === "PENGURUS_RT") return { id: access.wilayahRtId! };
  return { rwId: access.wilayahRwId! };
}

export function wargaScopeWhere(access: StaffAccess) {
  if (access.role === "ADMIN") return {};
  if (access.role === "PENGURUS_RT") return { wilayahRtId: access.wilayahRtId! };
  return { wilayahRt: { is: { rwId: access.wilayahRwId! } } };
}

export async function assertWargaInScope(access: StaffAccess, wargaId: string) {
  const warga = await prisma.warga.findFirst({
    where: { id: wargaId, ...wargaScopeWhere(access) },
    select: { id: true, wilayahRtId: true },
  });
  if (!warga) throw new Error("Warga tidak ditemukan atau berada di luar wilayah tugas.");
  return warga;
}

export function assignedRtId(access: StaffAccess, selectedRtId?: string | null) {
  if (access.role === "PENGURUS_RT") return access.wilayahRtId!;
  if (access.role === "PENGURUS_RW") throw new Error("Pengurus RW tidak dapat mengubah data operasional.");
  if (!selectedRtId) throw new Error("Wilayah RT wajib dipilih.");
  return selectedRtId;
}
