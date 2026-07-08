"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TemplatePicker } from "@/components/admin/sections/TemplatePicker";
import type { SectionTemplate } from "@/lib/types";
import { createEmptyContent, serializeContent } from "@/lib/section-content";

export default function NewSectionPage() {
  const router = useRouter();

  const handleSelect = async (templateType: SectionTemplate) => {
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Новый раздел",
        templateType,
        contentJson: serializeContent(createEmptyContent(templateType)),
        isPublished: false,
      }),
    });
    if (res.ok) {
      const { id } = await res.json();
      router.push(`/admin/sections/${id}`);
    }
  };

  return (
    <AdminLayout>
      <header className="admin-page-head">
        <h1 className="admin-page-head__title">Новый раздел</h1>
        <p className="admin-page-head__sub">Выберите, как будет выглядеть раздел на экране</p>
      </header>
      <TemplatePicker onSelect={(tpl) => void handleSelect(tpl)} />
    </AdminLayout>
  );
}
