import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SlotEditor } from "@/components/admin/SlotEditor";
import { ensureDb } from "@/lib/db/ensure";
import { getSectionBySlotIndex } from "@/lib/db/queries";
import { parseSlotParam } from "@/lib/slot-utils";

interface SlotPageProps {
  params: Promise<{ slot: string }>;
}

export default async function AdminSlotPage({ params }: SlotPageProps) {
  const { slot } = await params;
  const slotIndex = parseSlotParam(slot);
  if (slotIndex === null) notFound();

  ensureDb();
  const section = getSectionBySlotIndex(slotIndex);
  if (!section) notFound();

  return (
    <AdminLayout>
      <SlotEditor section={section} />
    </AdminLayout>
  );
}
