import type { Product, ProductCondition, ProductFilters } from "@/types/commerce";

type SearchParamValue = string | string[] | undefined;

function first(v: SearchParamValue) {
  return Array.isArray(v) ? v[0] : v;
}

/** Parse catalog filter query params from /products or category pages. */
export function filtersFromSearchParams(
  sp: Record<string, SearchParamValue>,
): ProductFilters {
  const condition = first(sp.condition)?.split(",").filter(Boolean) as
    | ProductCondition[]
    | undefined;
  const availabilityRaw = first(sp.availability);
  const availability =
    availabilityRaw === "in_stock" || availabilityRaw === "out_of_stock"
      ? availabilityRaw
      : undefined;

  const minPriceRaw = first(sp.minPrice);
  const maxPriceRaw = first(sp.maxPrice);
  const minRatingRaw = first(sp.minRating);

  return {
    query: first(sp.q) || first(sp.query) || undefined,
    platform: first(sp.platform)?.split(",").filter(Boolean),
    brand: first(sp.brand)?.split(",").filter(Boolean),
    condition: condition?.length ? condition : undefined,
    minPrice: minPriceRaw && !Number.isNaN(Number(minPriceRaw)) ? Number(minPriceRaw) : undefined,
    maxPrice: maxPriceRaw && !Number.isNaN(Number(maxPriceRaw)) ? Number(maxPriceRaw) : undefined,
    minRating:
      minRatingRaw && !Number.isNaN(Number(minRatingRaw))
        ? Number(minRatingRaw)
        : undefined,
    availability,
    discount: first(sp.discount) === "1" ? true : undefined,
    age: first(sp.age) || undefined,
    audience: first(sp.audience) || undefined,
  };
}

/** Merge collection-scoped filters with URL filters (URL cannot escape collection). */
export function mergeCollectionFilters(
  base: ProductFilters,
  fromUrl: ProductFilters,
): ProductFilters {
  let condition = base.condition;
  if (fromUrl.condition?.length) {
    if (base.condition?.length) {
      const intersect = fromUrl.condition.filter((c) => base.condition!.includes(c));
      // Incompatible condition on a scoped page (e.g. New on Used Games) → no results
      if (intersect.length === 0) {
        return {
          ...base,
          ...fromUrl,
          category: base.category ?? fromUrl.category,
          condition: base.condition,
          discount: fromUrl.discount ?? base.discount,
          newArrival: fromUrl.newArrival ?? base.newArrival,
          tags: ["__no_match__"],
        };
      }
      condition = intersect;
    } else {
      condition = fromUrl.condition;
    }
  }

  return {
    ...base,
    ...fromUrl,
    category: base.category ?? fromUrl.category,
    condition,
    discount: fromUrl.discount ?? base.discount,
    newArrival: fromUrl.newArrival ?? base.newArrival,
  };
}

function platformHaystack(product: Product): string {
  return [
    ...product.platform,
    product.category,
    ...product.categoryPath,
    ...product.tags,
    product.title,
    product.handle,
  ]
    .join(" ")
    .toLowerCase();
}

/** Match filter checkbox labels to product platforms (including aliases). */
export function productMatchesPlatform(product: Product, selected: string): boolean {
  if (product.platform.includes(selected)) return true;

  const hay = platformHaystack(product);
  const key = selected.toLowerCase().trim();

  switch (key) {
    case "playstation 5":
      return /\bps5\b|playstation\s*5|ps\s*5/.test(hay);
    case "playstation 4":
      // Prefer explicit PS4; exclude PS5-only titles.
      if (/\bps5\b|playstation\s*5|ps\s*5/.test(hay) && !/\bps4\b|playstation\s*4|ps\s*4/.test(hay)) {
        return false;
      }
      return /\bps4\b|playstation\s*4|ps\s*4/.test(hay);
    case "xbox series x|s":
      return /xbox\s*series|series\s*x|series\s*s/.test(hay);
    case "xbox one":
      return /xbox\s*one/.test(hay);
    case "nintendo switch":
      return /nintendo\s*switch|\bswitch\b/.test(hay);
    case "pc":
      return /\bpc\b/.test(hay);
    default:
      return hay.includes(key);
  }
}

export function productMatchesAnyPlatform(
  product: Product,
  selected: string[] | undefined,
): boolean {
  if (!selected?.length) return true;
  return selected.some((p) => productMatchesPlatform(product, p));
}

/** Guess publisher brand from a game title for catalog brand filters. */
export function inferGameBrand(title: string): string {
  const t = title.toLowerCase();
  if (/assassin|far cry|watch dogs|avatar|rainbow six|for honor/.test(t)) return "Ubisoft";
  if (/call of duty|crash|spyro/.test(t)) return "Activision";
  if (/battlefield|fifa|fc\s*\d|madden|need for speed|star wars jedi|crysis|dead space|mirror'?s edge|dragon age|mass effect|apex/.test(t))
    return "EA";
  if (/grand theft|gta|red dead|bully/.test(t)) return "Rockstar";
  if (/nba\s*2k|wwe\s*2k|borderlands|bioShock|civilization/.test(t)) return "2K";
  if (/tekken|dark souls|elden|nioh|scode|digimon|pac-man|ace combat|tales of|dragon ball|souls/.test(t))
    return "Bandai Namco";
  if (/resident evil|monster hunter|street fighter|devil may cry|megaman|mega man/.test(t))
    return "Capcom";
  if (/batman|mortal kombat|injustice|middle-earth|harry potter|hogwarts/.test(t))
    return "Warner Bros";
  if (/doom|wolfenstein|quake|rage|dishonored|prey|elder scrolls|fallout|starfield/.test(t))
    return "Bethesda";
  if (/final fantasy|dragon quest|kingdom hearts|nier|octopath/.test(t)) return "Square Enix";
  if (/diablo|overwatch|warcraft|starcraft|hearthstone/.test(t)) return "Blizzard";
  if (/destiny|halo|forza|gears|sea of thieves|state of decay|ori /.test(t)) return "Microsoft";
  if (/spider-man|spiderman|god of war|horizon|uncharted|last of us|ghost of tsushima|bloodborne|days gone|death stranding|detroit|returnal|ratchet|sackboy|astro bot|gran turismo|until dawn|dreams|driveclub/.test(t))
    return "Sony";
  if (/zelda|mario|pokemon|pokémon|splatoon|animal crossing|metroid|kirby|fire emblem|smash/.test(t))
    return "Nintendo";
  if (/control|alan wake|quantum break/.test(t)) return "Remedy";
  if (/back 4 blood|evolve/.test(t)) return "Warner Bros";
  if (/code vein|darksiders|lords of the fallen/.test(t)) return "THQ Nordic";
  if (/dead by daylight/.test(t)) return "Behaviour";
  if (/cyberpunk|witcher|thronebreaker/.test(t)) return "CD Projekt";
  if (/don bradman|cricket|big bash/.test(t)) return "Big Ant";
  if (/sherlock|crimes/.test(t)) return "Frogwares";
  if (/disney|aladdin|infinity/.test(t)) return "Disney";
  if (/agents of mayhem|saints row/.test(t)) return "Deep Silver";
  if (/aven colony/.test(t)) return "Team17";
  if (/arkanoid/.test(t)) return "Retro";
  if (/alekhine|deus ex/.test(t)) return "Square Enix";
  if (/biomutant/.test(t)) return "THQ Nordic";
  if (/blood bowl/.test(t)) return "Focus";
  if (/dead rising|deadlight/.test(t)) return "Capcom";
  return "ToyCompany";
}
