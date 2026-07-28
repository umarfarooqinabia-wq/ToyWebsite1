import { NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const suggestions = await commerce.searchSuggestions(q, 8);
  return NextResponse.json(suggestions);
}
