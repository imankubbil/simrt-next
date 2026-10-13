import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

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
        if (credentials.loginSebagai && user.role !== credentials.loginSebagai) return null;

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
          select: { password: true, role: true, warga: { select: { statusAktif: true } } },
        });
        const version = currentUser && createHash("sha256").update(currentUser.password).digest("hex");
        if (!currentUser || version !== token.credentialVersion || currentUser.role !== token.role || (currentUser.role === "WARGA" && !currentUser.warga?.statusAktif)) {
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
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/portal");

  return session;
}
