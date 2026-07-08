import { MuseumLogo } from "@/components/kiosk/MuseumLogo";

interface KioskPageHeaderProps {
  title: string;
  logoSize?: number;
}

export function KioskPageHeader({ title, logoSize = 52 }: KioskPageHeaderProps) {
  return (
    <header className="kiosk-header">
      <MuseumLogo size={logoSize} className="kiosk-header__logo" />
      <h1 className="kiosk-header__title">{title}</h1>
    </header>
  );
}
