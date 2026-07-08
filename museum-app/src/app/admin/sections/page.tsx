"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminToast } from "@/components/admin/AdminToast";
import { SectionList } from "@/components/admin/sections/SectionList";
import type { Section } from "@/lib/types";

function SectionsPageContent() {
  const { showToast } = useAdminToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/sections");
    if (res.ok) setSections(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const moveSection = async (id: string, dir: -1 | 1) => {
    const index = sections.findIndex((s) => s.id === id);
    const next = index + dir;
    if (next < 0 || next >= sections.length) return;
    const reordered = [...sections];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setSections(reordered);
    await fetch("/api/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: reordered.map((s) => s.id) }),
    });
    showToast("Порядок сохранён");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/sections/${deleteId}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== deleteId));
    setDeleteId(null);
    showToast("Раздел удалён");
  };

  return (
    <>
      <div className="admin-sections-page">
        <header className="admin-page-head admin-sections-page__head">
          <div>
            <h1 className="admin-page-head__title">Разделы музея</h1>
            <p className="admin-page-head__sub">
              Общие для горизонтального и вертикального экрана
            </p>
          </div>
          <Link href="/admin/sections/new" className="admin-btn-primary admin-btn-primary--large">
            + Создать раздел
          </Link>
        </header>

        {loading ? (
          <p className="admin-loading">Загрузка...</p>
        ) : (
          <SectionList
            sections={sections}
            onMove={(id, dir) => void moveSection(id, dir)}
            onDelete={setDeleteId}
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить раздел?"
        message="Это действие нельзя отменить. Раздел исчезнет с экрана музея."
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

export default function AdminSectionsPage() {
  return (
    <AdminLayout>
      <SectionsPageContent />
    </AdminLayout>
  );
}
