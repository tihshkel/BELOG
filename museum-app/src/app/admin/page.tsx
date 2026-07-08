import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";

const tiles = [
  {
    href: "/admin/sections",
    title: "Разделы музея",
    sub: "Создание и редактирование экспозиции",
  },
  {
    href: "/admin/horizontal/home",
    title: "Главная экрана",
    sub: "Флаг, герб, история музея",
  },
  {
    href: "/display/horizontal",
    title: "Открыть киоск",
    sub: "Посмотреть, как видят посетители",
    external: true,
  },
];

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <header className="admin-page-head">
        <h1 className="admin-page-head__title">Панель управления</h1>
        <p className="admin-page-head__sub">Выберите, что хотите изменить</p>
      </header>

      <div className="admin-dashboard-grid">
        {tiles.map((tile) =>
          tile.external ? (
            <a
              key={tile.href}
              href={tile.href}
              target="_blank"
              rel="noreferrer"
              className="touch-tile admin-dashboard-card"
            >
              <h2 className="admin-dashboard-card__title">{tile.title}</h2>
              <p className="admin-dashboard-card__desc">{tile.sub}</p>
            </a>
          ) : (
            <Link key={tile.href} href={tile.href} className="touch-tile admin-dashboard-card">
              <h2 className="admin-dashboard-card__title">{tile.title}</h2>
              <p className="admin-dashboard-card__desc">{tile.sub}</p>
            </Link>
          )
        )}
      </div>

      <div className="admin-dashboard-screens">
        <p className="admin-label">Главная страница для каждого экрана</p>
        <div className="admin-dashboard-screens__links">
          <Link href="/admin/horizontal/home" className="admin-btn-secondary">
            Горизонтальный
          </Link>
          <Link href="/admin/vertical/home" className="admin-btn-secondary">
            Вертикальный
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
