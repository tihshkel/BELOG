import { redirect } from "next/navigation";

interface LegacySymbolsPageProps {
  params: Promise<{ orientation: string }>;
}

export default async function LegacySymbolsPage({ params }: LegacySymbolsPageProps) {
  const { orientation } = await params;
  if (orientation === "vertical") {
    redirect("/admin/site?tab=symbols&orientation=vertical");
  }
  redirect("/admin/site?tab=symbols");
}
