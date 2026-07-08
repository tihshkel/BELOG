"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useCallback } from "react";
import type { ScreenOrientation } from "@/lib/types";
import { useKioskData } from "@/hooks/useKioskData";
import { BookNavigator } from "@/components/kiosk/BookNavigator";
import { HomePage } from "@/components/kiosk/HomePage";
import { SectionsGrid } from "@/components/kiosk/SectionsGrid";
import { SectionPage } from "@/components/kiosk/SectionPage";

interface KioskAppProps {
  orientation: ScreenOrientation;
}

export function KioskApp({ orientation }: KioskAppProps) {
  const { data, loading, error } = useKioskData(orientation);
  const [currentPage, setCurrentPage] = useState(0);

  const handleSectionSelect = useCallback((index: number) => {
    setCurrentPage(2 + index);
  }, []);

  const pages = useMemo(() => {
    if (!data) return [];

    const pageList = [
      <HomePage key="home" orientation={orientation} homeContent={data.homeContent} />,
      <SectionsGrid
        key="grid"
        orientation={orientation}
        sections={data.sections}
        onSelect={handleSectionSelect}
      />,
    ];

    data.sections.forEach((section, index) => {
      pageList.push(
        <SectionPage
          key={section.id}
          section={section}
          orientation={orientation}
        />
      );
    });

    return pageList;
  }, [data, orientation, handleSectionSelect]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-transparent">
        <motion.div
          className="rounded-full border-2 border-gray-200 border-t-blue"
          style={{ width: "clamp(32px, 8cqw, 48px)", height: "clamp(32px, 8cqw, 48px)" }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <p
          className="font-mono uppercase tracking-[0.25em] text-muted"
          style={{ fontSize: "clamp(0.6rem, 1.6cqw, 0.75rem)" }}
        >
          Загрузка
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-transparent p-8 text-center">
        <p className="text-muted" style={{ fontSize: "clamp(0.85rem, 2.4cqw, 1rem)" }}>
          {error ?? "Ошибка загрузки"}
        </p>
      </div>
    );
  }

  return (
    <BookNavigator
      pages={pages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      showNextOnFirst
    />
  );
}
