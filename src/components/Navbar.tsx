"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Settings,
  User,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", forAdmin: false, icon: LayoutDashboard },
    { href: "/clients", label: "Müşteriler", forAdmin: true, icon: Briefcase },
    { href: "/projects", label: "Projeler", forAdmin: true, icon: FolderKanban },
    { href: "/my-tasks", label: "Görevlerim", forAdmin: false, icon: CheckSquare },
    { href: "/reports", label: "Raporlar", forAdmin: true, icon: BarChart3 },
    { href: "/admin", label: "Ayarlar", forAdmin: true, icon: Settings },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.forAdmin || isAdmin
  );

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 dark:bg-dark-bg dark:border-dark-border h-20">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <div className="text-2xl font-black text-primary-600">UGI</div>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-gray-100 dark:bg-dark-card rounded-xl" />
            <div className="w-10 h-10 bg-gray-100 dark:bg-dark-card rounded-xl" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 dark:bg-dark-bg/80 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-black bg-gradient-to-r from-primary-600 to-blue-400 bg-clip-text text-transparent">
                UGI
              </Link>
            </div>
            <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${pathname === item.href
                      ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "text-gray-500 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-card/50"
                    }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all dark:bg-dark-card dark:text-gray-400 dark:hover:bg-dark-card/80"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="h-8 w-[1px] bg-gray-100 dark:bg-dark-border mx-2 hidden sm:block" />

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 transition-transform hover:scale-105">
                <User size={20} />
              </div>
              <div className="ml-3 hidden md:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {session?.user?.name}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {isAdmin ? "Yönetici" : "Çalışan"}
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
              title="Güvenli Çıkış"
            >
              <LogOut size={20} />
            </button>

            <button
              className="lg:hidden p-2.5 rounded-xl bg-gray-50 text-gray-500 dark:bg-dark-card dark:text-gray-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 dark:bg-dark-bg dark:border-dark-border p-4 space-y-2">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 text-base font-semibold rounded-xl transition-all ${pathname === item.href
                  ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card"
                }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
