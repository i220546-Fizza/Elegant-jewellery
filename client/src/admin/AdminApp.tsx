import { lazy, Suspense, useState } from 'react';
import { NavLink, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/ui/Logo';
import { CloseIcon, MenuIcon } from '../components/ui/Icons';
import { Spinner } from '../components/ui/Feedback';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const ProductForm = lazy(() => import('./pages/ProductForm'));
const Categories = lazy(() => import('./pages/Categories'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Customers = lazy(() => import('./pages/Customers'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Coupons = lazy(() => import('./pages/Coupons'));
const Messages = lazy(() => import('./pages/Messages'));

const NAV = [
  { to: '/admin', label: 'Analytics', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/coupons', label: 'Discount codes' },
  { to: '/admin/messages', label: 'Messages' },
];

/** The NB Classic Scents back office: calm, dense and functional. */
const AdminApp = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 font-sans text-[11px] uppercase tracking-wide2 transition ${isActive ? 'bg-ivory/10 text-ivory' : 'text-ivory/55 hover:text-ivory'}`}
        >
          {({ isActive }) => (
            <>
              <span className={`h-1 w-1 rounded-full ${isActive ? 'bg-gold' : 'bg-transparent'}`} />
              {n.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[240px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-ink px-5 py-7 text-ivory transition-transform duration-500 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <Logo tone="ivory" />
          <button type="button" className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <p className="mb-4 mt-10 px-3 font-sans text-[9.5px] uppercase tracking-luxe text-gold">Back office</p>
        {nav}
        <div className="absolute inset-x-5 bottom-7 space-y-3 border-t border-ivory/10 pt-5 text-xs">
          <p className="truncate text-ivory/60">{user?.email}</p>
          <div className="flex gap-4 font-sans text-[10px] uppercase tracking-wide2">
            <Link to="/" className="text-ivory/70 hover:text-gold">
              View store
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="uppercase tracking-wide2 text-ivory/70 hover:text-gold"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-taupe bg-ivory/90 px-5 backdrop-blur lg:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
            <MenuIcon />
          </button>
          <span className="ml-4 font-sans text-[11px] uppercase tracking-wide2">Back office</span>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="messages" element={<Messages />} />
              <Route path="*" element={<p className="text-stone">Page not found.</p>} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminApp;
