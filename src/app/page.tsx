import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  redirect(role === "WARGA" ? "/portal" : "/dashboard");
}
