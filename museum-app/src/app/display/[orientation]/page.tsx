import { KioskApp } from "@/components/kiosk/KioskApp";
import { KioskBodyClass } from "@/components/kiosk/KioskBodyClass";
import { KioskViewport } from "@/components/kiosk/KioskViewport";
import type { ScreenOrientation } from "@/lib/types";

export default async function DisplayPage({
  params,
}: {
  params: Promise<{ orientation: string }>;
}) {
  const { orientation } = await params;

  if (orientation !== "horizontal" && orientation !== "vertical") {
    return <div className="flex h-screen items-center justify-center text-cream">Неверный экран</div>;
  }

  return (
    <>
      <KioskBodyClass />
      <KioskViewport orientation={orientation as ScreenOrientation}>
        <KioskApp orientation={orientation as ScreenOrientation} />
      </KioskViewport>
    </>
  );
}
