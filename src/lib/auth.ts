import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
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
      },
      async authorize(credentials) {
        if (!credentials?.nik || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { nik: credentials.nik },
          include: { warga: true },
        });
        if (!user) return null;

        const valid = await compare(credentials.password, user.password);
        if (!valid) return null;
        if (user.role === "WARGA" && !user.warga?.statusAktif) return null;

        return {
          id: user.id,
          name: user.namaLengkap,
          email: user.nik,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
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

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/portal");

  return session;
}
