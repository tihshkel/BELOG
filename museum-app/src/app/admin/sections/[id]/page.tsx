import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SectionEditor } from "@/components/admin/sections/SectionEditor";
import { ensureDb } from "@/lib/db/ensure";
import { getSectionById } from "@/lib/db/queries";

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  ensureDb();
  const section = getSectionById(id);

  if (!section) notFound();

  return (
    <AdminLayout>
      <SectionEditor section={section} />
    </AdminLayout>
  );
}
