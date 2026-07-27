# ToyCompany — Headless Gaming E-Commerce

Modern Next.js storefront for PlayStation, Xbox, Nintendo, PC games, and gaming accessories.

**Brand:** ToyCompany (original — not affiliated with GameStop or console manufacturers)

## Stack

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS
- **Commerce:** Shopify Storefront API (recommended) with a swappable `CommerceProvider`
- **Demo mode:** Rich local catalog when Shopify is not configured
- **State:** Zustand (cart, wishlist, compare, theme)
- **Payments (server-side hooks):** Stripe, JazzCash, Easypaisa, COD, Bank Transfer

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Uploads & lifetime data on Vercel

Vercel’s filesystem is **read-only** and `/tmp` is wiped on every deploy. This app stores **lifetime** data in **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** so pushes never wipe your business data:

| Data | Storage |
|------|---------|
| User registrations | `users.json` in Blob |
| Sell CD requests | `sell-requests.json` + photos |
| Exchange CD requests | `exchange-requests.json` + photos |
| Orders | `orders.json` |
| Stock / custom CDs | `cd-inventory.json` |
| Articles | `articles.json` |
| Uploaded images | private Blob → served via `/api/media/...` |

Writes use optimistic locking (ETag) so concurrent registrations / requests don’t overwrite each other.

**Setup (required for production):**

1. In the Vercel project: **Storage → Create → Blob**
2. Connect the store (adds `BLOB_READ_WRITE_TOKEN`)
3. Redeploy

Admin dashboard shows a **Lifetime data store** status banner. You can also call `GET /api/admin/persistence` while logged in as admin.

Locally (no token): data still lives in `./data/` and uploads in `public/uploads/`.

## Shopify setup

1. Create a Shopify store and custom app with **Storefront API** access.
2. Set in `.env.local`:

```env
COMMERCE_PROVIDER=shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_or_storefront_token
```

3. Manage products, collections, inventory, discounts, and orders in **Shopify Admin**.
4. Tag products with `featured`, `best-seller`, `new-arrival`, `pre-owned`, and `platform:PlayStation 5` for richer filtering.

## Architecture

```
src/lib/commerce/     # CommerceProvider facade (demo | shopify | future NestJS)
src/components/       # UI, layout, product, catalog, home
src/store/            # Client cart / wishlist / compare
src/app/              # Routes (SEO categories, PDP, cart, checkout, account)
```

Swap backends by implementing `CommerceProvider` — UI stays unchanged.

## Key routes

| Path | Purpose |
|------|---------|
| `/` | Homepage |
| `/products` | Catalog + filters |
| `/playstation`, `/xbox`, `/nintendo`, … | Category pages |
| `/playstation/ps5-games/...` | Nested SEO paths |
| `/product/[slug]` | Product detail |
| `/cart`, `/checkout` | Cart & checkout |
| `/wishlist`, `/compare`, `/search` | Merchandising tools |
| `/account/*` | Customer dashboard |
| `/admin` | Demo admin metrics |

## Order alerts (free)

On every successful checkout the server notifies:

| Channel | Free service | Destination |
|---------|--------------|-------------|
| Email | [FormSubmit](https://formsubmit.co) | `toycompany1@gmail.com` |
| SMS | [TextBelt](https://textbelt.com) (1/day free) | `+923322235956` |

**First email:** FormSubmit sends a confirmation link to that Gmail — click it once, then order emails will arrive.

**SMS limit:** Free TextBelt key allows ~1 SMS per day. Set `TEXTBELT_API_KEY` to a paid TextBelt key for higher volume, or add `WEB3FORMS_ACCESS_KEY` for more reliable free email.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
