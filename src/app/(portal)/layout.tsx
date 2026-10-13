import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PortalSidebar } from "@/components/layout/portal-sidebar";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) redirect("/login");
  if ((session.user as { role?: string }).role !== "WARGA") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <PortalSidebar />
      <main className="min-w-0 flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
