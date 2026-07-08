import Image from "next/image";
import Link from "next/link";
import { MuseumLogo } from "@/components/kiosk/MuseumLogo";
import { SCREEN_SPECS } from "@/lib/screen-specs";

const screens = [
  {
    orientation: "horizontal" as const,
    href: "/display/horizontal",
    title: "Горизонтальный",
    sub: SCREEN_SPECS.horizontal.label,
    image: "/assets/kiosk-horizontal.webp",
    imageSize: "clamp(130px, 30cqw, 240px)",
  },
  {
    orientation: "vertical" as const,
    href: "/display/vertical",
    title: "Вертикальный",
    sub: SCREEN_SPECS.vertical.label,
    image: "/assets/kiosk-vertical.webp",
    imageSize: "clamp(120px, 26cqw, 220px)",
  },
];

export function LandingPage() {
  return (
    <div className="home-scene">
      <header className="home-top home-top--row">
        <MuseumLogo size={44} className="shrink-0" />
        <div className="min-w-0">
          <p className="home-top__org">Белорусское общество глухих</p>
          <h1 className="home-top__title">Музей БелОГ</h1>
        </div>
      </header>

      <div className="home-items home-items--row">
        {screens.map((screen) => (
          <Link
            key={screen.orientation}
            href={screen.href}
            className="home-item home-item--link"
          >
            <div
              className="home-item__img"
              style={{ width: screen.imageSize, height: screen.imageSize }}
            >
              <Image
                src={screen.image}
                alt={screen.title}
                width={240}
                height={240}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="home-item__label">{screen.title}</p>
            <p className="home-item__sub">{screen.sub}</p>
          </Link>
        ))}
      </div>

      <div className="nav-dock nav-dock--home landing-dock">
        <Link href="/admin" className="nav-btn nav-btn--primary nav-btn--wide">
          Админ-панель
        </Link>
      </div>
    </div>
  );
}
