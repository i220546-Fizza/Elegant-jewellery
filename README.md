# Elegant Jewellery

A full-stack, production-quality e-commerce website for **Elegant Jewellery** — a premium, minimal, feminine jewellery brand. Built with React + TypeScript + Vite + Tailwind CSS on the frontend and Node.js + Express + MongoDB (Mongoose) on the backend.

> This repository was empty when this build started (no prior commits, no product images). Since no product photography existed and external image hosts are blocked by this environment's network policy, all product/hero imagery was generated as original, cohesive line-art SVG artwork in the brand's champagne-gold palette (see **Product Images** below). Everything else — auth, cart, checkout, orders, reviews, wishlist, admin panel — is fully wired to a real MongoDB database, not mocked.

## Design System (3D Luxury Redesign)

The storefront was redesigned around a "luxury showroom" feel using **Framer Motion** plus native CSS 3D transforms — no Three.js/WebGL, so it stays fast and lightweight:

- `src/hooks/useTilt.ts` — spring-driven 3D tilt-on-hover for product/category cards (`perspective` + `rotateX/rotateY`), no-ops under `prefers-reduced-motion`.
- `src/components/Reveal.tsx` — scroll-triggered fade/slide-up wrapper (`whileInView`) used across every homepage section for the "fashion site" scroll feel.
- `src/components/Hero.tsx` — mouse-parallax floating jewellery pieces, ambient glow blobs, gold particles, all disabled under reduced motion.
- `src/components/CartDrawer.tsx` — glassmorphism slide-in bag, opened from the navbar cart icon (`CartContext.isDrawerOpen`), with Escape-to-close and scroll lock.
- `src/components/FeaturedCollection.tsx` / `BrandStory.tsx` / `InteractiveShowcase.tsx` — new homepage sections (asymmetric bento grid, split-layout scroll parallax, glass "display case" spotlight).
- Admin panel intentionally stays plain/professional (no 3D effects), and is code-split via `React.lazy` so customers never download that bundle.
- `@media (prefers-reduced-motion: reduce)` in `index.css` strips CSS keyframe animations globally; Framer Motion components separately check `useReducedMotion()`.
- Verified with Playwright at 1440px and 390px viewports: no horizontal overflow on any page, no console/runtime errors.

---

## 1. Project Structure

```
Elegant-jewellery/
├── client/                      # React + TypeScript + Vite + Tailwind frontend
│   ├── public/images/           # Hero banner, about page art, logo mark (SVG)
│   └── src/
│       ├── components/          # Navbar, Footer, ProductCard, ProductGrid, OrderTable, etc.
│       ├── context/              # AuthContext, CartContext, WishlistContext
│       ├── layouts/              # MainLayout (storefront), AdminLayout (dashboard)
│       ├── pages/                 # Home, Shop, ProductDetails, Cart, Checkout, ...
│       │   └── admin/            # AdminDashboard, AdminProducts, AdminOrders, ...
│       ├── services/             # axios API clients (auth, products, orders, admin, users)
│       ├── types/                # Shared TypeScript interfaces
│       └── utils/                # formatCurrency, formatDate, etc.
│
├── server/                      # Node.js + Express + MongoDB backend
│   ├── config/db.js              # Mongoose connection
│   ├── models/                   # User, Product, Order (Mongoose schemas)
│   ├── controllers/              # Business logic per resource
│   ├── routes/                   # Express routers
│   ├── middleware/                # JWT auth, admin guard, multer upload, error handler
│   ├── seed/seedProducts.js      # Seeds 20 products + creates the first admin account
│   └── uploads/products/         # Generated SVG product images + admin-uploaded images
│
└── README.md
```

## 2. What Was Built

**Backend (`server/`)**
- `config/db.js` — Mongoose/MongoDB connection with clear failure messages.
- `models/User.js` — name, email, hashed password (bcrypt), role (`customer`/`admin`), address, wishlist.
- `models/Product.js` — name, slug, description, price, category, material, images, sizes, stock, `featured`, `bestseller`, `isNewArrival`, embedded reviews, text search index.
- `models/Order.js` — order items, customer info, shipping address, payment method, status (`Pending → Confirmed → Processing → Shipped → Delivered`, or `Cancelled`), totals.
- `middleware/authMiddleware.js` — JWT verification (`protect`) and admin authorization (`admin`).
- `middleware/uploadMiddleware.js` — Multer image upload with type/size validation.
- `middleware/errorMiddleware.js` — centralized error handling (validation errors, duplicate keys, cast errors, 404s).
- `controllers/` + `routes/` for **auth**, **products**, **orders**, **users** (profile/wishlist), **uploads**, and **admin** (dashboard stats).
- `seed/seedProducts.js` — seeds 20 real products across all 4 categories and creates/promotes an admin account from `.env`.

**Frontend (`client/`)**
- Luxury design system in `tailwind.config.js` (ivory/cream/beige/champagne-gold/brown palette, Playfair Display + Cormorant Garamond + Inter typography, soft shadows, subtle animations).
- `context/AuthContext.tsx`, `CartContext.tsx`, `WishlistContext.tsx` — global state backed by JWT + localStorage, synced to the backend when logged in.
- Reusable components: `Navbar`, `Footer`, `ProductCard`, `ProductGrid`, `CategoryCard`, `QuickViewModal`, `QuantitySelector`, `StarRating`, `OrderTable`, `StatCard`, `SalesTrendChart`, `LoadingSpinner`, `EmptyState`, `ProtectedRoute`.
- Storefront pages: `Home`, `Shop` (search/filter/sort/pagination), `ProductDetails` (gallery, sizes, reviews, related products), `Cart`, `Checkout` (Cash on Delivery), `OrderConfirmation`, `Login`, `Signup`, `ForgotPassword`/`ResetPassword`, `Profile` (order history + settings), `Wishlist`, `About`, `Contact` (form + FAQ).
- Admin pages (`/admin`, protected + role-gated): `AdminDashboard` (stats, sales trend chart, low-stock alerts, recent orders), `AdminProducts` (list/delete), `AdminProductForm` (create/edit + image upload), `AdminOrders` (filter by status), `AdminOrderDetails` (change status).

## 3. How the Frontend Works

- **Vite + React + TypeScript**, routed with `react-router-dom` (`src/App.tsx`). `MainLayout` wraps all storefront pages with the `Navbar`/`Footer`/toast host; `AdminLayout` wraps the admin panel with a sidebar and is gated by `ProtectedRoute adminOnly`.
- **State**: `AuthContext` holds the logged-in user and JWT (stored in `localStorage` as `ej_token`); `CartContext` persists the cart to `localStorage`; `WishlistContext` syncs to the backend for logged-in users and falls back to `localStorage` for guests.
- **API calls** go through `src/services/*.ts`, which use a shared `axios` instance (`src/services/api.ts`) that automatically attaches the JWT and normalizes error messages.
- **Dev proxy**: `vite.config.ts` proxies `/api` and `/uploads` to the backend (`http://localhost:5000` by default), so the frontend never needs a hardcoded backend URL in development.
- **Styling**: Tailwind CSS utility classes plus a small set of `@layer components` (`btn-primary`, `btn-gold`, `card-luxe`, `input-luxe`, etc.) in `src/index.css` for consistent, reusable luxury UI patterns.

## 4. How the Backend Works

- **Express** app in `server/server.js`: security-conscious CORS (only `CLIENT_URL` origins allowed), JSON body parsing, request logging in development, static serving of `/uploads`, and centralized error handling.
- **Auth**: `POST /api/auth/register` and `/login` issue JWTs (`utils/generateToken.js`); `GET /api/auth/me` returns the current user via the `protect` middleware. Passwords are hashed with bcrypt before saving (`models/User.js` pre-save hook) and never returned in API responses.
- **Products**: `GET /api/products` supports `search`, `category`, `minPrice`/`maxPrice`, `sort` (`newest`, `price-asc`, `price-desc`, `rating`, `name-asc`), `featured`, `bestseller`, and pagination. Admin-only routes create/update/delete products and manage stock; any logged-in user can post a review.
- **Orders**: `POST /api/orders` works for both guests and logged-in customers, verifies stock/price server-side against the database (never trusts the client), decrements stock, and computes shipping (free over Rs. 15,000). Customers can view `GET /api/orders/my-orders`; admins can view/filter all orders and update status via `PUT /api/orders/:id/status`.
- **Uploads**: `POST /api/uploads` (admin-only) accepts up to 6 images via Multer and returns their public `/uploads/...` paths for use in the product form.
- **Admin stats**: `GET /api/admin/stats` aggregates total orders/sales/products/customers, low-stock products, recent orders, order status breakdown, and a 14-day sales trend.

## 5. How MongoDB Is Connected

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` to either:
   - A local MongoDB instance: `mongodb://127.0.0.1:27017/elegant-jewellery`, or
   - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string.
2. `server/config/db.js` connects via Mongoose when the server starts (`connectDB()` in `server.js`) and exits with a clear error if `MONGO_URI` is missing or unreachable.
3. All models (`User`, `Product`, `Order`) live in `server/models/` and are used exclusively by the backend — **the frontend never talks to MongoDB directly**, only through the REST API, and credentials stay server-side in `.env` (which is git-ignored).

> Note: this sandboxed build environment has no local `mongod` and no network access to download one, so the database layer couldn't be exercised end-to-end here. The Express server itself was verified to boot correctly and serve requests (health check, 404/error handling, CORS) — connect it to a real MongoDB instance as described above to use the full app.

## 6. Running the Project

**Backend**
```bash
cd server
cp .env.example .env      # then edit MONGO_URI, JWT_SECRET, ADMIN_EMAIL/PASSWORD
npm install
npm run seed               # seeds 20 products + creates the first admin account
npm run dev                 # starts the API on http://localhost:5000
```

**Frontend** (in a separate terminal)
```bash
cd client
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open `http://localhost:5173` — the Vite dev server proxies `/api` and `/uploads` to the backend automatically.

**Production build**
```bash
cd client && npm run build   # outputs static files to client/dist
cd server && npm start       # serve the API (front it with your own static host/CDN or reverse proxy for client/dist)
```

## 7. Creating/Logging In as Admin

Running `npm run seed` in `server/` automatically creates an admin account using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from your `.env` (defaults: `admin@elegantjewellery.com` / `ChangeMe123!` — **change these before deploying**). To log in:

1. Go to `http://localhost:5173/login` and sign in with the admin email/password.
2. Navigate to `http://localhost:5173/admin` — the dashboard is protected by `ProtectedRoute adminOnly`, which checks `user.role === 'admin'` from the JWT-authenticated `/api/auth/me` response.

To promote an existing customer account to admin instead, either re-run the seed script with `ADMIN_EMAIL` set to that user's email (it promotes existing users), or update the `role` field to `"admin"` directly in the `users` collection.

## 8. Adding Products Through the Admin Panel

1. Sign in as an admin and go to **Admin → Products → Add Product**.
2. Upload one or more images (stored under `server/uploads/products/` via `POST /api/uploads`), or reuse the generated placeholder art.
3. Fill in name, category, material, price, stock, optional sizes (comma-separated), and the `Featured` / `Bestseller` / `New Arrival` flags.
4. Submit — this calls `POST /api/products`, which validates the payload, generates a unique slug, and saves the product to MongoDB. It's immediately visible on the storefront (`Shop`, `Home`, category pages).
5. Edit or delete any product from the **Admin → Products** table at any time; stock automatically decrements as real orders are placed.

## 9. How Customers Place Orders

1. Browse **Shop** (search, filter by category/price, sort, or toggle Featured/Bestseller) or a product's detail page, choose a size if applicable, and **Add to Cart** or **Buy Now**.
2. On **Cart**, adjust quantities or remove items, then **Proceed to Checkout**.
3. On **Checkout**, enter contact + shipping details and confirm **Cash on Delivery** as the payment method, then **Place Order**.
4. `POST /api/orders` re-validates stock and pricing against MongoDB (never trusting client-submitted prices), creates the order, decrements stock, and returns the order.
5. The customer is redirected to **Order Confirmation**, showing the order ID, items, totals, customer/delivery info, and an estimated delivery message.
6. Logged-in customers can review all past orders under **My Account → Order History**; admins see and manage every order (including status updates) under **Admin → Orders**.

## 10. Product Images

No product photography or `images/` folder existed in this repository, and this build environment's network policy blocks all external image hosts (Unsplash, picsum.photos, placehold.co, etc.) — so real photos or third-party stock imagery could not be used. Instead, `server/uploads/products/i1.svg` … `i20.svg` are original, hand-authored vector illustrations (rings, necklaces, earrings, bracelets) generated with a consistent champagne-gold, editorial-sketch style matching the brand palette, along with a hero banner, about-page illustration, and monogram logo in `client/public/images/`.

To swap in real photography later: drop your own images into `server/uploads/products/` (or upload them through the admin panel), then either re-run `npm run seed` with updated image filenames in `server/seed/seedProducts.js`, or update each product's images via **Admin → Products → Edit**.
