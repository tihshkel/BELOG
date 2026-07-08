import { AdminLayout } from "@/components/admin/AdminLayout";
import { HomeEditor } from "@/components/admin/HomeEditor";
import { ensureDb } from "@/lib/db/ensure";
import { getHomeContent } from "@/lib/db/queries";
import type { ScreenOrientation } from "@/lib/types";

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ orientation: string }>;
}) {
  const { orientation } = await params;

  if (orientation !== "horizontal" && orientation !== "vertical") {
    return <div>Неверный экран</div>;
  }

  ensureDb();
  const data = getHomeContent(orientation as ScreenOrientation);

  return (
    <AdminLayout orientation={orientation as ScreenOrientation}>
      <HomeEditor orientation={orientation as ScreenOrientation} initialData={data} />
    </AdminLayout>
  );
}
