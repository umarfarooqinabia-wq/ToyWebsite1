import { NextResponse } from "next/server";

/** Exchange CD removed — this store sells toys only. */
export async function GET() {
  return NextResponse.json(
    { error: "Exchange CD is no longer available." },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Exchange CD is no longer available." },
    { status: 410 },
  );
}
