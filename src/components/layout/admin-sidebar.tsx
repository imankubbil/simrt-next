import Link from "next/link";
import {
  Users,
  UserCheck,
  FileText,
  CreditCard,
  History,
  Calendar,
  Package,
  Settings,
  LayoutDashboard,
  Building2,
} from "lucide-react";

const MENU = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Warga", href: "/warga", icon: Users },
  { label: "Kartu Keluarga", href: "/kartu-keluarga", icon: Building2 },
  { label: "Surat", href: "/surat", icon: FileText },
  { label: "Iuran", href: "/iuran", icon: CreditCard },
  { label: "Mutasi", href: "/mutasi", icon: History },
  { label: "Kegiatan", href: "/kegiatan", icon: Calendar },
  { label: "Inventaris", href: "/inventaris", icon: Package },
  { label: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-card min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-8 px-2">
          <Building2 className="w-7 h-7 text-primary" />
          <span className="font-bold text-xl tracking-tight">SIMRT</span>
        </div>
        <nav className="space-y-1">
          {MENU.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t pt-4 text-xs text-muted-foreground px-2">
        SIMRT v2.0 - Next.js
      </div>
    </aside>
  );
}
