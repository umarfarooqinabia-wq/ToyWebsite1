import { slugify } from "@/lib/utils";
import type { ContentFaq, ContentType } from "@/lib/admin/content-types";

export type AiGenerateInput = {
  mainKeyword: string;
  gameName: string;
  platform: string;
  contentType: ContentType;
  topics: string;
};

export type AiGenerateResult = {
  seoTitle: string;
  outline: string[];
  fullArticle: string;
  metaDescription: string;
  urlSlug: string;
  imageAlt: string;
  excerpt: string;
  faq: ContentFaq[];
  internalLinkSuggestions: string[];
  title: string;
  focusKeyword: string;
  tags: string[];
};

function paragraphsFromTopics(topics: string, game: string, platform: string, keyword: string) {
  const topicList = topics
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const usedTopics =
    topicList.length > 0
      ? topicList
      : [
          "gameplay feel in Pakistan",
          "physical disc vs digital",
          "who should buy it",
          "what to check before ordering",
        ];

  const bits = usedTopics.map(
    (topic, i) =>
      `## ${i + 1}. ${topic[0]?.toUpperCase()}${topic.slice(1)}\n\n` +
      `When Pakistani gamers look up **${keyword}**, ${topic.toLowerCase()} is usually part of the decision. ` +
      `For ${game || "this title"} on ${platform || "PlayStation / Xbox / Switch"}, a quality toy from a trusted local store still matters for resale value, gifting, and offline play. ` +
      `Focus on condition, region compatibility, and clear pricing before you checkout.`,
  );

  return bits.join("\n\n");
}

/** Offline / no-API fallback — original structured draft the admin can edit. */
export function generateSeoContentLocal(input: AiGenerateInput): AiGenerateResult {
  const keyword = input.mainKeyword.trim() || input.gameName.trim() || "gaming guide";
  const game = input.gameName.trim() || keyword;
  const platform = input.platform.trim() || "PS5";
  const typeLabel =
    input.contentType === "review"
      ? "Review"
      : input.contentType === "buying_guide"
        ? "Buying Guide"
        : input.contentType === "guide"
          ? "Guide"
          : input.contentType === "seo_page"
            ? "SEO Guide"
            : input.contentType === "article"
              ? "Article"
              : "News";

  const title = `${game} ${typeLabel} for ${platform} — ${keyword}`;
  const seoTitle = `${game} on ${platform}: ${keyword} | ToyCompany`.slice(0, 60);
  const metaDescription =
    `Read our ${typeLabel.toLowerCase()} on ${game} (${platform}). Learn about ${keyword}, disc buying tips for Pakistan, and shop related toys at ToyCompany.`.slice(
      0,
      155,
    );
  const urlSlug = slugify(`${game}-${platform}-${typeLabel}-${keyword}`.slice(0, 80));
  const outline = [
    `Introduction to ${game} and why ${keyword} matters`,
    `${platform} disc details Pakistani buyers should know`,
    "Gameplay / value highlights",
    "Who should buy this toy",
    "How to order from ToyCompany",
    "FAQ",
  ];

  const fullArticle = [
    `# ${title}`,
    "",
    `Looking for **${keyword}** advice in Pakistan? This ${typeLabel.toLowerCase()} covers ${game} on ${platform}, with practical tips for buying a physical disc locally.`,
    "",
    paragraphsFromTopics(input.topics, game, platform, keyword),
    "",
    `## Who should buy the ${game} disc?`,
    "",
    `Choose this ${platform} toy if you want lasting play, easier resale, or a gift-ready box. Digital codes are fine for convenience, but sealed discs remain popular across Lahore, Karachi, and Islamabad shops.`,
    "",
    `## Shop ${game} at ToyCompany`,
    "",
    `Browse related ${game} listings on our store, compare PS4 / PS5 / Xbox variants when available, and checkout with COD, JazzCash, Easypaisa, or bank transfer.`,
    "",
    `Internal links to add: [/product pages for ${game}](/products), [/news hub](/news), and any matching guide for ${platform}.`,
  ].join("\n");

  const faq: ContentFaq[] = [
    {
      question: `Is ${game} available as a physical disc in Pakistan?`,
      answer: `Yes — ToyCompany lists sealed and used ${platform} discs when stock is available. Check the product page for live quantity.`,
    },
    {
      question: `What should I check before buying ${game}?`,
      answer: `Confirm platform (${platform}), region compatibility, seal condition for new stock, and current price versus market rates.`,
    },
    {
      question: `Can I pay with COD or JazzCash?`,
      answer: `ToyCompany supports Cash on Delivery, JazzCash, Easypaisa, and bank transfer on eligible orders.`,
    },
  ];

  return {
    title,
    seoTitle,
    outline,
    fullArticle,
    metaDescription,
    urlSlug,
    imageAlt: `${game} ${platform} disc — ${keyword}`,
    excerpt: metaDescription.slice(0, 160),
    faq,
    internalLinkSuggestions: [
      `/product/${slugify(game)}-${slugify(platform)}`,
      `/games/${slugify(game)}`,
      `/news`,
      `/products?query=${encodeURIComponent(game)}`,
    ],
    focusKeyword: keyword,
    tags: [game, platform, keyword, typeLabel].map((t) => t.trim()).filter(Boolean),
  };
}

export async function generateSeoContentAi(
  input: AiGenerateInput,
): Promise<{ result: AiGenerateResult; provider: "openai" | "local" }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { result: generateSeoContentLocal(input), provider: "local" };
  }

  try {
    const prompt = `You are an SEO content writer for ToyCompany, a Pakistan toy store.
Write ORIGINAL, useful, human-friendly content (not fluff). Audience: Pakistani gamers buying physical discs.
Return ONLY valid JSON with keys:
title, seoTitle, outline (string array), fullArticle (markdown string), metaDescription, urlSlug, imageAlt, excerpt, faq (array of {question,answer}), internalLinkSuggestions (string array of paths), focusKeyword, tags (string array).

Input:
Main keyword: ${input.mainKeyword}
Game: ${input.gameName}
Platform: ${input.platform}
Content type: ${input.contentType}
Topics: ${input.topics}

Rules:
- seoTitle <= 60 chars, metaDescription <= 155 chars
- Include Pakistan buying context (COD, JazzCash, physical discs)
- Suggest internal links like /product/..., /news/..., /games/...
- FAQ: 3-5 items
- fullArticle: markdown with ## headings, 600-900 words feel`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SEO_MODEL || "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You output strict JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      return { result: generateSeoContentLocal(input), provider: "local" };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return { result: generateSeoContentLocal(input), provider: "local" };
    const parsed = JSON.parse(raw) as Partial<AiGenerateResult>;
    const fallback = generateSeoContentLocal(input);
    return {
      provider: "openai",
      result: {
        title: parsed.title || fallback.title,
        seoTitle: parsed.seoTitle || fallback.seoTitle,
        outline: Array.isArray(parsed.outline) ? parsed.outline : fallback.outline,
        fullArticle: parsed.fullArticle || fallback.fullArticle,
        metaDescription: parsed.metaDescription || fallback.metaDescription,
        urlSlug: parsed.urlSlug || fallback.urlSlug,
        imageAlt: parsed.imageAlt || fallback.imageAlt,
        excerpt: parsed.excerpt || fallback.excerpt,
        faq: Array.isArray(parsed.faq) ? parsed.faq : fallback.faq,
        internalLinkSuggestions: Array.isArray(parsed.internalLinkSuggestions)
          ? parsed.internalLinkSuggestions
          : fallback.internalLinkSuggestions,
        focusKeyword: parsed.focusKeyword || fallback.focusKeyword,
        tags: Array.isArray(parsed.tags) ? parsed.tags : fallback.tags,
      },
    };
  } catch {
    return { result: generateSeoContentLocal(input), provider: "local" };
  }
}
