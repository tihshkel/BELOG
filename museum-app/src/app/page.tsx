import { LandingPage } from "@/components/landing/LandingPage";
import { KioskBodyClass } from "@/components/kiosk/KioskBodyClass";
import { KioskViewport } from "@/components/kiosk/KioskViewport";

export default function HomePage() {
  return (
    <>
      <KioskBodyClass />
      <KioskViewport orientation="horizontal">
        <LandingPage />
      </KioskViewport>
    </>
  );
}
