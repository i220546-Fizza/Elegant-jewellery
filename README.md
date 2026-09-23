# NB Classic Scents

A full-stack luxury fragrance e-commerce site for **NB Classic Scents**: an editorial storefront with a cinematic 3D perfume showroom, real customer accounts, a cart, checkout and orders, and a complete admin back office.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Three.js · React Three Fiber · Drei · Framer Motion on the front end; Node.js · Express · MongoDB · Mongoose · JWT (httpOnly cookie) · bcrypt on the back end.

---

## Quick start

Requirements: Node 18+ and a MongoDB database (local `mongod` or MongoDB Atlas).

```bash
# 1. API
cd server
cp .env.example .env          # set MONGO_URI, JWT_SECRET and ADMIN_EMAIL / ADMIN_PASSWORD
npm install
npm run seed                  # catalogue, categories, discount codes, admin account
# or: npm run seed:demo       # the same, plus sample customers, orders and reviews for the dashboard
npm run dev                   # http://localhost:5000

# 2. Storefront (second terminal)
cd client
npm install
npm run dev                   # http://localhost:5173  (proxies /api and /uploads to :5000)
```

Sign in at `/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, then open `/admin`. **Change the default admin password before deploying.**

Demo discount codes (seeded): `WELCOME10`, `SIGNATURE15` (orders over PKR 25,000), `GIFT1000`.

### Production (single origin)

```bash
cd client && npm run build        # creates client/dist
cd ../server && NODE_ENV=production npm start
```

When `client/dist` exists, Express serves the storefront and the API from the same origin, so the auth cookie works with no CORS setup. Set `CLIENT_URL` to your public URL: it is used in password-reset and order-email links, and any *other* origin that calls the API must be listed there.

---

## Brand & design system

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0D0E10` | Header text, footer, key typography, dark sections |
| `ivory` | `#F8F7F3` | Primary background — the site stays bright |
| `gold` | `#C9B27C` | Logo accents, rules, hover states, small highlights only |
| `stone` | `#8D8A83` | Secondary text, metadata |
| `taupe` | `#D8D0C2` | Product cards, editorial blocks, borders |

- **Type:** Cormorant Garamond (serif — headings, product names, brand statements) and Jost (sans — navigation, buttons, prices, forms), with wide letter-spacing on uppercase labels.
- **Logo:** framed `NB` monogram plus stacked "NB / CLASSIC SCENTS" (`components/ui/Logo.tsx`).
- **Motion:** slow (0.8–1.5 s), eased `cubic-bezier(0.22, 1, 0.36, 1)` reveals, parallax and cross-fades. No bouncing or spinning, and everything respects `prefers-reduced-motion`.

## The 3D showroom

Every bottle is built procedurally in `client/src/three/`, so each product has a real 3D presentation without needing any model files:

- `shapes.ts` — five silhouettes (classic, tall, round, facet, flacon) with a thick glass base, a neck, a gold collar and a cap.
- `PerfumeBottle.tsx` — physically based glass (transmission, IOR, attenuation), liquid tinted per product, champagne-gold / black-lacquer / ivory caps, and a foil label drawn on a canvas.
- `Studio.tsx` — a studio environment built from light-formers (no HDR download), a key light that drifts with the cursor, and a soft contact shadow.
- `BottleScene.tsx` — the cursor-follow rig (window-wide in the hero), drag-to-rotate (full 360° on product pages), scroll-linked positioning, a gentle float, and the champagne highlight ring used by *The Composition*.

**Performance:** three.js is its own lazy chunk (`Bottle3D.tsx`). A studio-render poster shows instantly and cross-fades to the live scene. Rendering pauses when the canvas is off-screen, the pixel ratio drops when frames slow down, and phones and low-power devices get a lighter material path. If WebGL is unavailable, the poster stays.

**Custom models:** admins can upload a `.glb` / `.gltf` per product. It replaces the procedural bottle in every 3D view and is scaled to the same height automatically.

**Product photography** in `server/uploads/products/*.webp` is rendered from the same 3D model:

```bash
cd client && npm run dev                                 # in one terminal
NODE_PATH=$(npm root -g) npm run render:bottles [slug…]  # needs Playwright + Chromium
```

Admin-uploaded photos are used instead whenever a product has them.

## What's included

**Storefront** — cinematic hero · signature trio (Éclat / Essence / Noir) · shop grid by category · *The Composition* interactive notes · brand story · collections page · fragrance listing with category / family / price filters, search, sort and pagination · product page (3D viewer, gallery, sizes with per-size stock, quantity, add to bag, buy now, wishlist, description, top / heart / base notes, ingredients, longevity and sillage, shipping, reviews with rating breakdown, related fragrances) · quick view · search overlay · bag drawer · cart (quantities, remove, discount codes, subtotal, shipping, total) · checkout (contact, address, saved addresses, cash on delivery / card / online payment) · order confirmation · guest order tracking · contact, FAQ, shipping, returns, privacy and terms pages · loading, empty and error states throughout.

**Accounts** — register, login, logout, forgot / reset password, profile, order history and order details (with self-cancel while pending), wishlist, saved addresses, change password. Guest bags and wishlists merge into the account on sign-in, and the bag is stored on the server so it follows the customer across devices.

**Admin (`/admin`)** — analytics (revenue, orders, customers, average order, 7/30/90-day revenue trend, orders by status, bestsellers, revenue by payment method, inventory summary, recent orders) · products (create / edit / delete, sizes with price + stock + SKU, discount %, fragrance notes, categories, image upload, 3D model upload, bottle appearance with live 3D preview, visibility and merchandising flags) · categories · orders (search / filter, status updates with history, tracking number, payment status, customer details) · customers (spend and order history, deactivate, promote to admin, delete) · inventory (low-stock and sold-out views with inline restocking) · discount codes · contact messages.

## Security

- Passwords hashed with bcrypt (cost 12); at least 8 characters, including a letter and a number.
- The JWT lives in an **httpOnly, SameSite=Lax** cookie (`Secure` in production), so page scripts cannot read it. Changing or resetting a password invalidates older sessions.
- Rate limiting on auth, password reset, newsletter, contact and order lookup; a general API limit; `helmet` with a tailored Content Security Policy.
- Prices, discounts, stock and totals are always recalculated on the server. Stock is reserved atomically per size, with rollback, so two buyers cannot take the last bottle.
- Reset tokens are random, stored hashed, single-use and expire after 30 minutes.

## Payments — please read

- **Cash on Delivery** is fully functional. The order is marked paid when an admin sets it to *Delivered*.
- **Card Payment** validates the card (Luhn check, expiry, CVC) and stores only the brand and last four digits, but **no payment gateway is connected, so no money is actually charged**. Before taking real card payments, replace `authorizeCard` in `server/utils/payments.js` with your processor (e.g. Stripe or PayFast) and send a tokenised card from the browser instead of raw digits.
- **Online Payment** (bank transfer / JazzCash / Easypaisa) creates the order as *Awaiting Transfer*. Your team shares account details with the customer and marks the order *Paid* in the admin.

## Email

Set `SMTP_HOST`, `SMTP_USER` and `SMTP_PASS` to send password-reset and order-confirmation emails, and `STORE_EMAIL` to receive contact-form enquiries (they are always visible under **Admin → Messages** either way). Without SMTP, emails are printed to the server console and, outside production, the reset link is shown in the browser so the flow can still be tested.

## Configuration

`server/.env` — see `server/.env.example` for every option (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, admin seed credentials, shipping fee / free-shipping threshold, SMTP, Cloudinary).

`client/.env` (optional) — `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE` (shown on the contact page), and `VITE_API_URL` if the API is hosted on a different origin.

Uploads go to `server/uploads/` by default. On hosts with ephemeral disks (e.g. Render's free tier), set the `CLOUDINARY_*` variables so uploaded images and 3D models persist.

`client/public/sitemap.xml` and `robots.txt` point at `https://elegant-jewllery.onrender.com` — update them when the site moves to its own domain.

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register · login · logout · forgot-password`, `PUT /api/auth/reset-password/:token`, `GET /api/auth/me` |
| Catalogue | `GET /api/products` (search, category, family, price, sort, page), `GET /api/products/meta`, `GET /api/products/:slug`, `GET /api/products/:id/related`, reviews `GET/POST/DELETE /api/products/:id/reviews`; admin `POST/PUT/DELETE /api/products`, `PATCH /api/products/:id/stock` |
| Categories | `GET /api/categories`; admin `POST/PUT/DELETE` |
| Cart | `POST /api/cart/quote` (guests), `GET/PUT /api/cart`, `POST /api/cart/merge` |
| Wishlist | `GET /api/wishlist`, `POST /api/wishlist/:productId` (toggle), `POST /api/wishlist/merge` |
| Account | `PUT /api/users/profile · password`, `GET/POST/PUT/DELETE /api/users/addresses` |
| Orders | `POST /api/orders`, `GET /api/orders/my-orders`, `GET /api/orders/:id`, `GET /api/orders/lookup`, `PUT /api/orders/:id/cancel`; admin `GET /api/orders`, `PUT /api/orders/:id/status` |
| Admin | `GET /api/admin/stats · inventory · customers`, `GET/PUT/DELETE /api/admin/customers/:id`, `/api/coupons`, `/api/contact`, `POST /api/uploads/images · model` |

Models: `User`, `Product`, `Category`, `Order`, `Review`, `Wishlist`, `Cart`, `Coupon`, `Subscriber`, `ContactMessage`.

## Tests

```bash
cd server && npm test        # integration tests against MONGO_TEST_URI (default: local mongod)
cd client && npm run typecheck && npm run lint && npm run build
```

## Project structure

```
client/
  scripts/render-bottles.mjs     studio renders of every bottle
  src/three/                     procedural bottle, studio lighting, scene rig, GLB loader
  src/components/{home,product,layout,account,ui}/
  src/pages/                     storefront + account/ + info/
  src/admin/                     back office (code-split from the storefront)
  src/context/                   auth, cart (server-synced), wishlist, UI
  src/services/                  typed API client
server/
  models/ controllers/ routes/ middleware/ utils/
  seed/catalogue.js              16 fragrances, 7 categories, discount codes
  seed/seed.js                   npm run seed | seed:demo | seed:destroy
  tests/api.test.js
  uploads/products/              rendered product imagery
```
