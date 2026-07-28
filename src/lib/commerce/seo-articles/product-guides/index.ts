import type { ContentArticle } from "@/lib/admin/content-types";
import batchProductGuides from "./batch-product-guides.json";

/** Product and category buying guides (batch of 50). */
export const PRODUCT_GUIDE_ARTICLES = batchProductGuides as ContentArticle[];
