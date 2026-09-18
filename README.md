# AbioStore

A premium fashion e-commerce experience for a family-owned clothing business in Edo State, Nigeria — built as a single-page React app.

## What's included

- Homepage, shop/collection page with filters, product detail page, cart drawer, wishlist, search overlay, checkout flow, order confirmation, order tracking, About, Store, and Lookbook pages
- WhatsApp ordering on every product (auto-generates an order message to `wa.me`)
- An **Admin panel** (`Store Admin` link in the footer) where the owner can upload real product photos and add/edit/delete products — no code changes needed
- Cinematic CSS animations: hero reveal, scroll reveals, magnetic buttons, custom cursor (desktop), product card hover states
- Light/dark mode, mobile-first responsive layout, `prefers-reduced-motion` support
- All placeholder imagery is generated locally as inline SVG — **nothing is loaded over the network**, so there are no broken-image states out of the box

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Configuration

Almost everything business-specific lives in one place: `brandConfig` near the top of `src/App.jsx`.

```js
const brandConfig = {
  brandName: "AbioStore",
  whatsapp: "2349152910157",   // international format, no + or spaces
  phone: "0915 291 0157",
  address: "14 Akpakpava Road, Benin City, Edo State",
  adminPin: "2468",            // change this before going live
  ...
};
```

- **Brand name / logo text**: change `brandName` — it's used everywhere (nav, footer, hero copy, order confirmations), so nothing needs to change elsewhere.
- **WhatsApp number**: change `whatsapp` (digits only, country code first, no leading `0`).
- **Admin PIN**: change `adminPin`. This is a lightweight owner-only gate for the demo, **not real authentication** — see Security below.

## Owner product management (Admin panel)

Click **Store Admin** in the footer, enter the PIN (default `2468`), then:

- **Add a product**: name, price, category, sizes, colors, description, stock, and upload one or more real photos from a phone or computer.
- **Edit or delete** any existing product from the same screen.

On the Vercel storefront, product changes are saved in the browser's `localStorage`, so the same browser can keep products after a refresh. This is browser-local persistence, not a shared database: changes are not automatically available on another phone, computer, or customer browser. For permanent shared owner data across devices, connect a real database and image storage service.

## Payment integration points

The checkout UI already has the provider selection built (Paystack, Flutterwave, Bank Transfer, Cash/Pay at Store), but **no payment is actually processed** — this is intentionally a placeholder so nothing fake looks real. To connect real payments:

1. Add your Paystack/Flutterwave public keys as environment variables (`.env`, never committed) and call their client SDKs from the "Place Order" button in `CheckoutPage`.
2. Verify payment **server-side** before marking an order paid — never trust the client.
3. Never store card details yourself; both providers handle PCI compliance for you.

## Remaining limitations / recommended next steps

1. **Backend & shared persistence**: the owner panel currently persists products in browser localStorage. For production, add a real backend/database and image storage so products, orders, and inventory are shared across devices.
2. **Real authentication for Admin**: the current PIN gate (default `2468`) is a demo owner gate. Replace it with real authentication before launch because a frontend PIN is not secure.
3. **Real product photography**: replace the generated placeholder images by uploading real photos through the Admin panel, or by editing the seed data in `SEED_PRODUCTS`.
4. **Payment provider wiring**: see above.
5. **Order tracking**: currently shows a static demo timeline; connect it to real order status once a backend exists.
6. **SEO/multi-page routing**: this app uses client-side view-switching rather than real URLs/routes. For full SEO (indexable `/products/[slug]` etc.), consider migrating to Next.js with this UI as a starting point.

## Tech stack

React 18, Tailwind CSS, lucide-react icons, Vite. No other runtime dependencies — animations are hand-written CSS, no animation library required.
