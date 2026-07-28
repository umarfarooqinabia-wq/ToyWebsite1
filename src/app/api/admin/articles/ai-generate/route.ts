import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import { generateSeoContentAi } from "@/lib/admin/ai-seo-content";

const schema = z.object({
  mainKeyword: z.string().min(2).max(80),
  gameName: z.string().max(80).optional().default(""),
  platform: z.string().max(40).optional().default(""),
  contentType: z.enum([
    "news",
    "article",
    "review",
    "guide",
    "buying_guide",
    "seo_page",
  ]),
  topics: z.string().max(500).optional().default(""),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI input" }, { status: 400 });
  }

  const { result, provider } = await generateSeoContentAi({
    mainKeyword: parsed.data.mainKeyword,
    gameName: parsed.data.gameName,
    platform: parsed.data.platform,
    contentType: parsed.data.contentType,
    topics: parsed.data.topics,
  });

  return NextResponse.json({
    result,
    provider,
    message:
      provider === "openai"
        ? "Generated with OpenAI — review before publishing."
        : "Generated with built-in SEO draft engine (set OPENAI_API_KEY for richer AI). Edit before publishing.",
  });
}
