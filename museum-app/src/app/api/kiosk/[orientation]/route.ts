import { NextResponse } from "next/server";
import { ensureDb } from "@/lib/db/ensure";
import { getKioskData } from "@/lib/db/queries";
import type { ScreenOrientation } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orientation: string }> }
) {
  const { orientation } = await params;

  if (orientation !== "horizontal" && orientation !== "vertical") {
    return NextResponse.json({ error: "Invalid orientation" }, { status: 400 });
  }

  ensureDb();
  const data = getKioskData(orientation as ScreenOrientation);
  return NextResponse.json(data);
}
