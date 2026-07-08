"use client";

import { useEffect } from "react";

export function KioskBodyClass() {
  useEffect(() => {
    document.body.classList.add("kiosk-mode");
    return () => document.body.classList.remove("kiosk-mode");
  }, []);
  return null;
}
