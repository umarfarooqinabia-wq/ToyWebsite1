import {
  buildAdminAwareCatalog,
  readInventory,
  type CdInventoryStore,
} from "@/lib/admin/stock-db";
import { fetchCatalogPages } from "@/lib/commerce/toycompany-client";
import type { Product } from "@/types/commerce";

/**
 * Same base catalog the public storefront uses (toycompany.pk Shopify AJAX).
 * Used by admin stock so both UIs share one product list.
 */
export async function getStorefrontBaseCatalog(maxPages = 40): Promise<Product[]> {
  return fetchCatalogPages(maxPages);
}

/** Apply admin stock qty / sell price / custom SKUs / hidden flags. */
export async function withAdminInventory(
  products: Product[],
  inv?: CdInventoryStore,
): Promise<Product[]> {
  try {
    const inventory = inv ?? (await readInventory());
    return buildAdminAwareCatalog(products, inventory);
  } catch (err) {
    console.error("[inventory] apply failed", err);
    return products;
  }
}
