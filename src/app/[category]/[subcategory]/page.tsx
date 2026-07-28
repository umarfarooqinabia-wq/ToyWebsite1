import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CategoryView, generateCategoryMetadata } from "@/components/catalog/category-view";
import { commerce } from "@/lib/commerce";
import { resolveCollectionHandle } from "@/lib/safe-routes";
import {
  productSeoDescription,
  productSeoKeywords,
  productSeoTitle,
} from "@/lib/seo-meta";

type Params = Promise<{ category: string; subcategory: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { subcategory } = await params;
  const product = await commerce.getProductByHandle(subcategory);
  if (product) {
    return {
      title: productSeoTitle(product),
      description: productSeoDescription(product),
      keywords: productSeoKeywords(product),
      alternates: { canonical: `/product/${product.handle}` },
    };
  }
  return generateCategoryMetadata(subcategory);
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { category, subcategory } = await params;

  // Support SEO product URLs like /playstation/ps5-games/slug via deeper route;
  // if subcategory is actually a product handle, redirect to canonical product URL.
  const asProduct = await commerce.getProductByHandle(subcategory);
  if (asProduct) {
    redirect(`/product/${asProduct.handle}`);
  }

  const collection = await resolveCollectionHandle(subcategory);
  if (!collection) {
    // Fall back to parent category rather than a dead-end 404.
    const parent = await resolveCollectionHandle(category);
    redirect(parent ? `/${parent.handle}` : "/products");
  }

  return (
    <CategoryView
      handle={collection.handle}
      parentPath={[category]}
      searchParams={searchParams}
    />
  );
}
