import type { Metadata } from "next";
import { CategoryView, generateCategoryMetadata } from "@/components/catalog/category-view";

type Params = Promise<{ category: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const RESERVED = new Set([
  "products",
  "product",
  "cart",
  "checkout",
  "wishlist",
  "compare",
  "search",
  "account",
  "api",
  "admin",
  "find",
  "gift-finder",
  "track",
]);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  if (RESERVED.has(category)) return {};
  return generateCategoryMetadata(category);
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { category } = await params;
  return <CategoryView handle={category} searchParams={searchParams} />;
}
