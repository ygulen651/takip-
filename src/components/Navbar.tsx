"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", forAdmin: false },
    { href: "/clients", label: "Müşteriler", forAdmin: true },
    { href: "/projects", label: "Projeler", forAdmin: true },
    { href: "/tasks", label: "Görevler", forAdmin: true },
    { href: "/my-tasks", label: "Görevlerim", forAdmin: false },
    { href: "/reports", label: "Raporlar", forAdmin: true },
    { href: "/admin", label: "Admin Panel", forAdmin: true },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.forAdmin || isAdmin
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-primary-600">
                Ugi Takip
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{session?.user?.name}</span>
              <span className="ml-2 text-xs text-gray-500">
                {isAdmin ? "Admin" : "Çalışan"}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-secondary btn-sm"
            >
              Çıkış
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

