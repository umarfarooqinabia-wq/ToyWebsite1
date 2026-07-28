import type { Collection } from "@/types/commerce";

/**
 * Curated storefront collections mapped from toycompany.pk handles.
 * Used for nav, homepage grids, and category browse.
 */
export const TOY_NAV_COLLECTIONS: Collection[] = [
  {
    id: "col-new-arrival",
    handle: "new-arrival",
    title: "New Arrival",
    description: "Fresh toys added almost every day.",
    image:
      "https://cdn.shopify.com/s/files/1/0573/1260/8358/collections/magnetic-train-set-for-toddler-learning-216414_400x_59029294-a02e-464e-879d-26d58f19b4c1.webp",
    seoTitle: "New Arrival Toys | ToyCompany",
    seoDescription: "Shop the latest toys, baby gear, and outdoor fun just arrived in Pakistan.",
  },
  {
    id: "col-toys-for-boys",
    handle: "toys-for-boys",
    title: "Toys For Boys",
    description: "RC cars, action figures, diecast, outdoor play and more.",
    seoTitle: "Toys For Boys | ToyCompany",
    seoDescription: "Browse boys toys — remote control, vehicles, outdoor play and action toys.",
  },
  {
    id: "col-toys-for-girls",
    handle: "toys-for-girls",
    title: "Toys For Girls",
    description: "Dolls, kitchen playsets, fashion, and creative toys.",
    seoTitle: "Toys For Girls | ToyCompany",
    seoDescription: "Shop dolls, kitchen sets, playsets and toys for girls online in Pakistan.",
  },
  {
    id: "col-baby-toys",
    handle: "baby-toys",
    title: "Baby Toys",
    description: "Safe, age-appropriate toys and baby gear.",
    seoTitle: "Baby Toys & Gear | ToyCompany",
    seoDescription: "Buy baby toys, ride-ons, walkers, and essentials with nationwide delivery.",
  },
  {
    id: "col-diecast",
    handle: "die-cast-scale-models",
    title: "Diecast Models",
    description: "Pakistan’s biggest diecast scale model collection.",
    seoTitle: "Diecast Scale Models | ToyCompany",
    seoDescription: "Shop diecast cars, bikes, trucks and collectible scale models.",
  },
  {
    id: "col-rc",
    handle: "remote-control",
    title: "Remote Control",
    description: "RC cars, bikes, drones, jets and helicopters.",
    seoTitle: "Remote Control Toys | ToyCompany",
    seoDescription: "Remote control cars, drones and flying toys for kids and hobbyists.",
  },
  {
    id: "col-outdoor",
    handle: "outdoor-play",
    title: "Outdoor Play",
    description: "Ride-ons, scooters, pools, tents and water toys.",
    seoTitle: "Outdoor Play Toys | ToyCompany",
    seoDescription: "Outdoor toys, ride-ons, scooters and summer fun for kids in Pakistan.",
  },
  {
    id: "col-pools",
    handle: "swimming-pools",
    title: "Swimming Pools",
    description: "Intex pools, floats and water toys for summer.",
    seoTitle: "Swimming Pools & Water Toys | ToyCompany",
    seoDescription: "Shop Intex swimming pools, floats and water toys online.",
  },
  {
    id: "col-educational",
    handle: "educational-toys",
    title: "Educational Toys",
    description: "Learning toys, puzzles, blocks and creative kits.",
    seoTitle: "Educational Toys | ToyCompany",
    seoDescription: "Educational and learning toys for toddlers and kids.",
  },
  {
    id: "col-intex",
    handle: "intex",
    title: "Intex",
    description: "Official Intex pools and outdoor inflatables.",
    seoTitle: "Intex Pools & Toys | ToyCompany",
    seoDescription: "Shop authentic Intex swimming pools and inflatable toys.",
  },
  {
    id: "col-sale",
    handle: "toys-on-sale",
    title: "Sale",
    description: "Discounted toys and stock clearance deals.",
    seoTitle: "Toys on Sale | ToyCompany",
    seoDescription: "Save on toys with current deals and clearance prices.",
  },
  {
    id: "col-under-999",
    handle: "toys-under-999",
    title: "Under Rs. 999",
    description: "Budget-friendly toys under one thousand rupees.",
    seoTitle: "Toys Under Rs. 999 | ToyCompany",
    seoDescription: "Affordable toys under Rs. 999 with cash on delivery.",
  },
];

/** Homepage product grids (collection handle → section title). */
export const HOME_PRODUCT_SECTIONS = [
  { handle: "new-arrival", title: "New Arrival", href: "/new-arrival" },
  { handle: "die-cast-scale-models", title: "Diecast Scale Models", href: "/die-cast-scale-models" },
  { handle: "remote-control-cars-trucks", title: "RC Cars & Bikes", href: "/remote-control" },
  { handle: "intex", title: "Intex", href: "/intex" },
  { handle: "educational-toys", title: "Educational Toys", href: "/educational-toys" },
] as const;

/** Shop-by-category tiles on the homepage. */
export const HOME_CATEGORY_TILES = [
  { handle: "new-arrival", title: "New Arrival" },
  { handle: "toys-for-boys", title: "Toys For Boys" },
  { handle: "toys-for-girls", title: "Toys For Girls" },
  { handle: "baby-toys", title: "Baby Toys" },
  { handle: "swimming-pools", title: "Swimming Pools" },
  { handle: "outdoor-play", title: "Outdoor Play" },
  { handle: "die-cast-scale-models", title: "Diecast Models" },
  { handle: "educational-toys", title: "Educational" },
  { handle: "wooden", title: "Wooden" },
] as const;
