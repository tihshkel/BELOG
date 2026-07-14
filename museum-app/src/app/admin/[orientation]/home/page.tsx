import { redirect } from "next/navigation";

interface LegacyHomePageProps {
  params: Promise<{ orientation: string }>;
}

export default async function LegacyHomePage({ params }: LegacyHomePageProps) {
  const { orientation } = await params;
  if (orientation === "vertical") {
    redirect("/admin/site?orientation=vertical");
  }
  redirect("/admin/site");
}
