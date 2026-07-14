import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { ensureDb } from "@/lib/db/ensure";
import { getAllSections } from "@/lib/db/queries";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  ensureDb();
  return NextResponse.json(getAllSections());
}

export async function POST() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Создание разделов отключено — используйте фиксированные слоты 01–10" },
    { status: 405 }
  );
}

export async function PUT() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Порядок разделов фиксирован по номеру слота" },
    { status: 405 }
  );
}
