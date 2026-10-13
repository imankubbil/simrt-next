import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id && session.user.role) {
    const role = (session.user as { role?: string }).role;
    redirect(role === "WARGA" ? "/portal" : "/dashboard");
  }

  return (
    <LoginForm />
  );
}
