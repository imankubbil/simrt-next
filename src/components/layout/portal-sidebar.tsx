"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, FileText, CreditCard, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function PortalSidebar() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: "/portal", label: "Beranda", icon: Home },
    { href: "/portal/profil", label: "Profil Saya", icon: User },
    { href: "/portal/surat", label: "Layanan Surat", icon: FileText },
    { href: "/portal/iuran", label: "Riwayat Iuran", icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-card border-r flex flex-col justify-between h-screen sticky top-0">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-primary">Portal Warga</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Sistem Informasi RT</p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </aside>
  );
}
