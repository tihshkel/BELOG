import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SiteSettingsEditor } from "@/components/admin/SiteSettingsEditor";
import { ensureDb } from "@/lib/db/ensure";
import { getHomeContent, getProjectTheme } from "@/lib/db/queries";

export default function AdminSitePage() {
  ensureDb();
  const horizontalData = getHomeContent("horizontal");
  const verticalData = getHomeContent("vertical");
  const initialTheme = getProjectTheme();

  return (
    <AdminLayout>
      <Suspense fallback={<p className="admin-loading">Загрузка...</p>}>
        <SiteSettingsEditor
          horizontalData={horizontalData}
          verticalData={verticalData}
          initialTheme={initialTheme}
        />
      </Suspense>
    </AdminLayout>
  );
}
