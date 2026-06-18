import { NextRequest, NextResponse } from "next/server";
import { getAppData, saveGoals, saveProfile } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getAppData());
}

export async function PUT(request: NextRequest) {
  const payload = await request.json();
  if (payload.profile) await saveProfile(payload.profile);
  if (payload.goals) await saveGoals(payload.goals);
  return NextResponse.json(await getAppData());
}
