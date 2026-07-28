import { NextResponse } from "next/server";

/** Sell requests admin API removed for the toys storefront. */
export async function GET() {
  return NextResponse.json(
    { error: "Sell requests are no longer available." },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Sell requests are no longer available." },
    { status: 410 },
  );
}
