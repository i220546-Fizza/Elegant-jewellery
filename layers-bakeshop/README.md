# Layers Bakeshop

A full-stack, production-quality e-commerce website for **Layers Bakeshop** — a premium Pakistani dessert brand. Built with React + TypeScript + Vite + Tailwind CSS + Three.js/React Three Fiber + Framer Motion on the frontend, and Node.js + Express + MongoDB (Mongoose) on the backend.

> **On the brand identity:** `layers.pk` could not be inspected directly — this environment's network egress policy blocks that domain (confirmed via both an HTTP fetch tool and `curl`, both returned "blocked"/403). So the color system below is an **original palette built to match Layers' documented premium-dessert brand feel** (deep burgundy + warm gold on soft cream), not scraped/copied values. It's centralized in one place (`client/src/index.css` + `client/src/utils/colors.ts`) so real brand hex codes can be swapped in in minutes if you have them.
>
> **On imagery:** for the same reason, external stock-photo hosts are unreachable from this environment. All product/gallery imagery is generated as original SVG illustrations in the brand palette (see `scripts/generate-product-art.mjs`) rather than fetched or faked with broken links. Swap files in `client/public/images/products/` with real photography any time — nothing else needs to change.

---

## 1. Project Structure

```
layers-bakeshop/
├── client/                       # React + TypeScript + Vite + Tailwind frontend
│   ├── public/images/products/   # Generated SVG product art (swap for real photos anytime)
│   └── src/
│       ├── components/           # Navbar, Footer, ProductCard, CartDrawer, 3D hero, etc.
│       │   ├── 3d/                # React Three Fiber scene (cake model, floating crumbs)
│       │   └── admin/              # Admin-only components (product form modal)
│       ├── context/                # AuthContext, CartContext
│       ├── layouts/                # MainLayout (storefront), AdminLayout (dashboard)
│       ├── pages/                  # Home, Menu, ProductDetails, Checkout, Account, ...
│       │   └── admin/                # AdminDashboard, AdminProducts, AdminOrders, AdminCustomers
│       ├── services/                # axios API clients (auth, products, orders, admin)
│       ├── types/                    # Shared TypeScript interfaces
│       └── utils/                    # formatCurrency, formatDate, colors, slugify
│
├── server/                       # Node.js + Express + MongoDB backend
│   ├── config/                    # Mongoose connection, Cloudinary (optional)
│   ├── models/                     # User, Product, Order, Category (Mongoose schemas)
│   ├── controllers/                 # Business logic per resource
│   ├── routes/                       # Express routers
│   ├── middleware/                    # JWT auth, admin guard, multer upload, error handler
│   ├── seed/seedProducts.js           # Seeds 24 products across 8 categories + first admin account
│   └── uploads/products/               # Admin-uploaded product images (local disk storage)
│
├── scripts/generate-product-art.mjs   # Regenerates the placeholder SVG product art
└── README.md
```

## 2. Design System

All brand tokens live in `client/src/index.css` as CSS custom properties, mirrored in `client/src/utils/colors.ts` for use in Three.js materials and admin charts (CSS variables aren't readable by WebGL/canvas directly):

| Token | Hex | Used for |
|---|---|---|
| `--layers-primary` | `#6e1e2c` | Buttons, links, brand accents (deep burgundy) |
| `--layers-accent` | `#c9a24b` | Gold accents, badges, ratings, hero sparkles |
| `--layers-ink` | `#2b1b14` | Primary text, footer background, hero background |
| `--layers-background` | `#fbf7f1` | Page background (warm cream) |
| `--layers-surface` | `#ffffff` | Cards, panels, modals |
| `--layers-success` / `--layers-warning` / `--layers-error` | muted green / amber / red | Order status, form validation |

Typography: **Fraunces** (elegant serif) for headings/display text, **Inter** for body copy — loaded via Google Fonts in `index.css`.

Every surface — navbar, hero, buttons, product cards, cart, checkout, login/register, admin dashboard, footer, loading screen, 3D scene — draws from these same tokens.

## 3. What Was Built

**Frontend (`client/`)**
- 3D hero: React Three Fiber scene with a layered-cake model (stacked tiers, frosting swirl, gold trim rings), mouse-parallax rotation, ambient floating "crumb" particles, gold sparkles — lazy-loaded (`React.lazy` + `requestIdleCallback` + WebGL feature-detect) so it never blocks first paint and degrades gracefully on unsupported devices.
- Framer Motion throughout: staggered hero text reveal, scroll-triggered `Reveal` wrapper used on every section, 3D tilt-on-hover product cards (`useTilt`, CSS 3D transforms — no extra WebGL cost), magnetic buttons, animated cart drawer, animated checkout confirmation, animated admin stat counters and bar charts, animated category-tab pill.
- Custom cursor (desktop only, auto-disabled on touch devices and under `prefers-reduced-motion`).
- Layers-branded loading screen (short, layered-bar animation).
- Full storefront: Home, Menu (category tabs + search), Product Details (gallery, sizes, quantity, add-to-cart/buy-now, related products), Cart drawer, Checkout (form validation, COD/online payment selection, animated order confirmation), About, Gallery (masonry), Special Offers, Locations (searchable), Contact (form), Login/Register, Customer Account (order history with status badges).
- Full admin panel: dashboard (animated stat cards, revenue bar chart, order-status breakdown, top products), Products (table + add/edit modal with image upload, category/price/stock/availability), Orders (expandable rows, status update dropdown), Customers (list + per-customer order history).
- Error/empty states: 404 page, empty cart, no products found, product unavailable, API/network error with retry, login/checkout validation errors — all styled, none are blank screens.
- Accessibility: semantic labels/`aria-label`s on icon-only buttons, focus-visible outlines, alt text on meaningful images (empty alt on decorative ones), `prefers-reduced-motion` respected globally (CSS) and per-component (Framer Motion `useReducedMotion`, 3D scene, custom cursor).
- Performance: route-level code splitting (`React.lazy` for every page except Home), the 3D scene is its own lazy chunk (~260KB gzipped, only downloaded when idle), image `loading="lazy"` throughout, memoized cart totals.

**Backend (`server/`)**
- `config/db.js` — Mongoose connection with a clear, actionable error message if `MONGO_URI` is missing or unreachable.
- `models/User.js` — name, email (unique), phone, bcrypt-hashed password, role (`customer`/`admin`).
- `models/Product.js` — name, slug, description, ingredients, category (enum), price, optional sizes, images, rating/reviews, stock, availability + featured/bestseller/new/limited flags, text index for search.
- `models/Order.js` — embedded order items + shipping info, payment method, subtotal/delivery/total, status (`Pending → Confirmed → Preparing → Out for Delivery → Delivered`, or `Cancelled`), human-readable order number.
- `models/Category.js` — name/slug/description (seeded alongside products).
- `middleware/authMiddleware.js` — `protect` (JWT verification), `admin` (role guard), `optionalAuth` (lets guests place orders while still linking the order to a logged-in user's account).
- `middleware/uploadMiddleware.js` + `config/cloudinary.js` — Multer image upload; stores on local disk by default, or streams straight to Cloudinary when `CLOUDINARY_*` env vars are set (zero-config local dev, production-ready cloud storage when needed).
- `middleware/errorMiddleware.js` — centralized error handling (Mongoose validation errors, duplicate-key errors, cast errors, 404s) — every failure returns clean JSON, never a stack-trace crash.
- Order creation **re-prices and re-validates stock server-side** rather than trusting client-submitted totals, and decrements stock on successful checkout.
- `seed/seedProducts.js` — seeds 24 realistic products (3 each across Cakes, Cupcakes, Brownies, Cookies, Donuts, Desserts, Sundaes, Beverages) plus the 8 categories and a first admin account.

**Verification performed in this environment:** there is no MongoDB or Docker daemon available in this sandbox, so the seed script and live database calls could not be exercised end-to-end here. Instead: every server module was import-checked (no missing exports/typos), the full Express app (all routes + middleware chain) was booted and hit with real HTTP requests — confirming routing, JSON parsing, and the centralized error handler all behave correctly (a DB-dependent call fails as a clean JSON error rather than crashing the process). The client was fully type-checked (`tsc -b`, zero errors) and production-built (`vite build`, succeeds, 3D scene correctly isolated into its own lazy chunk). **You should run the full local flow yourself** once MongoDB is connected (see below) — register, browse, add to cart, check out, and confirm in the admin panel.

## 4. Windows Setup

### Prerequisites
- [Node.js 18+](https://nodejs.org) (this was built against Node 22)
- A MongoDB database — either:
  - **Local install:** [Install MongoDB Community Server](https://www.mongodb.com/try/download/community) for Windows, then make sure the "MongoDB" service is running (Services app, or `net start MongoDB` in an admin PowerShell).
  - **MongoDB Atlas (cloud, no local install):** create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), add a database user, allow-list your IP (or `0.0.0.0/0` for local dev), and copy the connection string it gives you.

### 1. Install dependencies

```powershell
cd layers-bakeshop\server
npm install

cd ..\client
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required for the client install: `@react-three/fiber`/`@react-three/drei`'s published peer-dependency range lags a couple of patch versions behind the React 19.2 that Vite scaffolds today. This is a peer-range mismatch, not a real incompatibility — the packages work fine together.

### 2. Configure the database connection

```powershell
cd ..\server
copy .env.example .env
```

Open `server\.env` in a text editor and set `MONGO_URI`:

- Local MongoDB: `MONGO_URI=mongodb://127.0.0.1:27017/layers-bakeshop`
- Atlas: `MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/layers-bakeshop`

Also set `JWT_SECRET` to any long random string (used to sign login tokens).

### 3. Seed the database

```powershell
cd layers-bakeshop\server
npm run seed
```

This creates 8 categories, 24 products, and a first admin account (`admin@layersbakeshop.com` / `Admin@12345` by default — change `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env` before seeding if you want different credentials). Run `npm run seed:destroy` to wipe products/categories.

### 4. Run the app (two terminals)

**Terminal 1 — backend:**
```powershell
cd layers-bakeshop\server
npm run dev
```
Runs on `http://localhost:5000`.

**Terminal 2 — frontend:**
```powershell
cd layers-bakeshop\client
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api` and `/uploads` requests to the backend (see `vite.config.ts`) — open this URL in your browser.

### 5. What you should see

- The homepage loads with the Layers loading animation, then the hero with a rotating 3D layered cake that responds to mouse movement.
- `/menu` shows the 24 seeded products with working category tabs and search.
- Adding items to the cart opens an animated cart drawer; checkout walks through delivery details → payment method → an animated order-confirmation screen.
- Registering an account and logging in as the seeded admin (`/login`) unlocks `/admin` — a dashboard with animated stats/charts, and full product/order/customer management.

### Production build

```powershell
cd layers-bakeshop\client
npm run build

cd ..\server
npm start
```
`server.js` serves the built `client/dist` directly, so a single `npm start` in `server/` is enough for a single-origin production deploy (set `NODE_ENV=production` in `.env`).

## 5. Environment Variables

See `server/.env.example` for the full list with comments. Nothing in `client/` needs an `.env` file — the dev server proxies `/api` to `http://localhost:5000` (see `client/vite.config.ts`), and in production the client is served from the same origin as the API.

## 6. Regenerating placeholder art

```powershell
cd layers-bakeshop
node scripts\generate-product-art.mjs
```
Regenerates every SVG in `client/public/images/products/`. To use real photography instead, just drop replacement files with the same names in that folder (or update the `images` field on each product via the admin panel's image upload).
