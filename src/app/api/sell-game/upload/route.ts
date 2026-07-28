import { NextResponse } from "next/server";

/** Sell Game uploads removed — this store sells toys only. */
export async function POST() {
  return NextResponse.json(
    { error: "Sell Game is no longer available." },
    { status: 410 },
  );
}
