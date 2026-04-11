import { getUserSites } from "@/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sites = await getUserSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error("Error fetching user sites:", error);
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 });
  }
}
