"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ScreenOrientation } from "@/lib/types";
import { MuseumLogo } from "@/components/kiosk/MuseumLogo";
import { AdminToastProvider } from "./AdminToast";

interface AdminLayoutProps {
  children: React.ReactNode;
  orientation?: ScreenOrientation;
}

function AdminLayoutInner({ children, orientation }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Главная", active: pathname === "/admin" },
    { href: "/admin/sections", label: "Разделы", active: pathname.startsWith("/admin/sections") },
    ...(orientation
      ? [
          {
            href: `/admin/${orientation}/home`,
            label: orientation === "horizontal" ? "Горизонт." : "Вертик.",
            active: pathname.includes("/home"),
          },
        ]
      : [
          { href: "/admin/horizontal/home", label: "Горизонт.", active: pathname === "/admin/horizontal/home" },
          { href: "/admin/vertical/home", label: "Вертик.", active: pathname === "/admin/vertical/home" },
        ]),
  ];

  return (
    <div className="admin-scene">
      <div className="admin-scene__bg" aria-hidden>
        <Image src="/assets/bg-horizontal.jpg" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="admin-scene__overlay" />
      </div>

      <div className="admin-scene__inner">
        <header className="home-top admin-scene__header">
          <MuseumLogo size={48} className="shrink-0" />
          <div className="min-w-0">
            <p className="home-top__org">Белорусское общество глухих</p>
            <h1 className="home-top__title">Музей БелОГ</h1>
          </div>
          <div className="admin-scene__header-actions">
            <Link href="/" className="admin-btn-secondary admin-btn-secondary--compact">
              На сайт
            </Link>
            <button type="button" className="admin-btn-ghost admin-btn-ghost--compact" onClick={() => void handleLogout()}>
              Выйти
            </button>
          </div>
        </header>

        <main className="admin-scene__main">{children}</main>

        <footer className="admin-scene__dock">
          <nav className="nav-dock admin-dock" aria-label="Навигация админки">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-dock__link${item.active ? " admin-dock__link--active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}

export function AdminLayout(props: AdminLayoutProps) {
  return (
    <AdminToastProvider>
      <AdminLayoutInner {...props} />
    </AdminToastProvider>
  );
}
