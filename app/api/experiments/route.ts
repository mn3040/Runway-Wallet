import { NextResponse } from "next/server";
import { getAppData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAppData();
  return NextResponse.json(data.experiments);
}
