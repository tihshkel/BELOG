import { redirect } from "next/navigation";
import { ensureDb } from "@/lib/db/ensure";
import { getSectionById } from "@/lib/db/queries";
import { formatSlotNumber } from "@/lib/slot-utils";

interface LegacySectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacySectionEditPage({ params }: LegacySectionPageProps) {
  const { id } = await params;
  ensureDb();
  const section = getSectionById(id);
  if (!section) {
    redirect("/admin/site");
  }
  redirect(`/admin/slots/${formatSlotNumber(section.slotIndex)}`);
}
