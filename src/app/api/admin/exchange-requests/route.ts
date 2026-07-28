import { NextResponse } from "next/server";

/** Exchange requests admin API removed for the toys storefront. */
export async function GET() {
  return NextResponse.json(
    { error: "Exchange requests are no longer available." },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Exchange requests are no longer available." },
    { status: 410 },
  );
}
