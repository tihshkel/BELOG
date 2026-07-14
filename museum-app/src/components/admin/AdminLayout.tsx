"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MuseumLogo } from "@/components/kiosk/MuseumLogo";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AdminSlotNav } from "./AdminSlotNav";
import { AdminToastProvider } from "./AdminToast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type NavItem =
  | { href: string; label: string; icon: string; external: true }
  | { href: string; label: string; icon: string; match: (path: string) => boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/site", label: "Настройки сайта", icon: "tune", match: (path) => path.startsWith("/admin/site") },
  { href: "/display/horizontal", label: "Превью киоска", icon: "open_in_new", external: true },
];

function isExternalNavItem(item: NavItem): item is Extract<NavItem, { external: true }> {
  return "external" in item;
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Навигация админки">
        <div className="admin-sidebar__brand">
          <MuseumLogo size={36} className="shrink-0" />
          <div className="min-w-0">
            <p className="admin-sidebar__org">Музей БелОГ</p>
            <p className="admin-sidebar__sub">Панель управления</p>
          </div>
        </div>

        <div className="admin-sidebar__group">
          <p className="admin-sidebar__group-label">Общее</p>
          <nav className="admin-sidebar__nav">
            {NAV_ITEMS.map((item) => {
              if (isExternalNavItem(item)) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-sidebar__link"
                  >
                    <MaterialIcon name={item.icon} size={20} className="admin-sidebar__icon" />
                    <span>{item.label}</span>
                  </a>
                );
              }

              const isActive = item.match(pathname);
              const className = `admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`;

              return (
                <Link key={item.href} href={item.href} className={className}>
                  <MaterialIcon name={item.icon} size={20} className="admin-sidebar__icon" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <AdminSlotNav />

        <div className="admin-sidebar__footer">
          <Link href="/" className="admin-sidebar__footer-link">
            <MaterialIcon name="home" size={18} />
            <span>На сайт</span>
          </Link>
          <button type="button" className="admin-sidebar__footer-link admin-sidebar__footer-link--danger" onClick={() => void handleLogout()}>
            <MaterialIcon name="logout" size={18} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <main className="admin-shell__content">{children}</main>
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
