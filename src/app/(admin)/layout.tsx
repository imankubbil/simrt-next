import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
