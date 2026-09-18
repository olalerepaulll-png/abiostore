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

Business contact details can be updated in the `brand` configuration object near the top of `src/App.jsx`. Admin authentication is handled by Supabase and is not hardcoded in the source code.

- **Brand name / logo text**: change `brandName` — it's used everywhere (nav, footer, hero copy, order confirmations), so nothing needs to change elsewhere.
- **WhatsApp number**: change `whatsapp` (digits only, country code first, no leading `0`).
## Owner product management (Admin panel)

Click **Store Admin** in the footer and sign in with the owner email/password account created in Supabase, then:

- **Add a product**: name, price, category, sizes, colors, description, stock, and upload one or more real photos from a phone or computer.
- **Edit or delete** any existing product from the same screen.

Product management is now connected to **Supabase Postgres + Storage**. Products are stored centrally, so a product added from the owner panel is available to every customer device. The storefront also subscribes to Supabase Realtime product changes, so customers who already have the shop open can receive catalogue updates without a refresh.

### Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run the complete `supabase/schema.sql` file. It creates the products table, Row Level Security policies, the public `product-images` storage bucket, image policies, starter products, and Realtime support.
3. In Supabase **Authentication → Users**, create the owner's email/password account.
4. Copy that user's UUID. In SQL Editor, run:
   ```sql
   insert into public.admins (user_id)
   values ('PASTE_OWNER_USER_UUID_HERE')
   on conflict (user_id) do nothing;
   ```
5. In Supabase **Project Settings → API**, copy the Project URL and **Publishable key**.
6. Add these variables to Vercel for **Production** (and Preview if you use it):
   ```text
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   ```
7. Redeploy Vercel.

The owner signs into **Store Admin** with the Supabase email/password account. No admin password or PIN is stored in the repository. Only users listed in `public.admins` can create, edit, or delete products. Customers can read products without signing in. Product photos are uploaded to Supabase Storage rather than stored in browser localStorage.

Supabase's React quickstart uses `@supabase/supabase-js` with Vite environment variables, and its Data API is protected with Row Level Security. citeturn0search1turn0search6

## Payment integration points

The checkout UI already has the provider selection built (Paystack, Flutterwave, Bank Transfer, Cash/Pay at Store), but **no payment is actually processed** — this is intentionally a placeholder so nothing fake looks real. To connect real payments:

1. Add your Paystack/Flutterwave public keys as environment variables (`.env`, never committed) and call their client SDKs from the "Place Order" button in `CheckoutPage`.
2. Verify payment **server-side** before marking an order paid — never trust the client.
3. Never store card details yourself; both providers handle PCI compliance for you.

## Remaining limitations / recommended next steps

1. **Orders & inventory backend**: products now use Supabase, but checkout/order records are still UI-only. Add `orders`, `order_items`, and inventory transactions before launch.
2. **Payment provider wiring**: Paystack/Flutterwave still need real server-side payment verification.
3. **Real product photography**: upload the store's real photos through the Admin panel. Supabase Storage keeps those files shared across devices.
4. **Payment provider wiring**: see above.
5. **Order tracking**: currently shows a static demo timeline; connect it to real order status once a backend exists.
6. **SEO/multi-page routing**: this app uses client-side view-switching rather than real URLs/routes. For full SEO (indexable `/products/[slug]` etc.), consider migrating to Next.js with this UI as a starting point.

## Tech stack

React 18, Tailwind CSS, lucide-react icons, Vite. No other runtime dependencies — animations are hand-written CSS, no animation library required.
