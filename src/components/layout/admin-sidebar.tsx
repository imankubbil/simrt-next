"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
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
  FileSpreadsheet,
  LogOut,
  KeyRound,
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
  { label: "Laporan & Export", href: "/laporan", icon: FileSpreadsheet },
  { label: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export function AdminSidebar() {
  return (
    <aside className="w-16 shrink-0 md:w-64 border-r bg-card min-h-screen p-2 md:p-4 flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex items-center justify-center md:justify-start gap-2 mb-8 px-2">
          <Building2 className="w-7 h-7 shrink-0 text-primary" aria-hidden="true" />
          <span className="hidden md:inline font-bold text-xl tracking-tight">SIM RT/RW</span>
        </div>
        <nav className="space-y-1">
          {MENU.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className="flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2 text-sm font-medium rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t pt-4 space-y-3">
        <Link href="/akun/password" aria-label="Ganti password" title="Ganti password" className="flex items-center justify-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground md:justify-start md:px-3">
          <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden md:inline">Ganti password</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Keluar"
          title="Keluar"
          className="flex w-full items-center justify-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground md:justify-start md:px-3"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden md:inline">Keluar</span>
        </button>
        <p className="hidden px-2 text-xs text-muted-foreground md:block">Sistem Informasi RT/RW</p>
      </div>
    </aside>
  );
}

