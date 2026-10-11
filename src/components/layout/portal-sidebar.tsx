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
    <aside className="w-16 shrink-0 md:w-64 bg-card border-r flex flex-col justify-between h-screen sticky top-0 overflow-y-auto">
      <div className="p-2 md:p-6 space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold tracking-tight text-primary">
            <span className="hidden md:inline">Portal Warga</span>
            <span className="md:hidden" aria-hidden="true">PW</span>
          </h2>
          <p className="hidden md:block text-xs text-muted-foreground mt-0.5">Sistem Informasi RT</p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className={`flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Log Out"
          title="Log Out"
          className="w-full flex items-center justify-center gap-2 px-2 md:px-3 py-2 border rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span className="hidden md:inline">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
