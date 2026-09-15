import { NavLink, Outlet, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BagIcon, ChevronRightIcon, GiftIcon, UserIcon } from '../components/Icons';

const LINKS = [
  { label: 'Dashboard', to: '/admin', icon: ChevronRightIcon, end: true },
  { label: 'Products', to: '/admin/products', icon: GiftIcon },
  { label: 'Orders', to: '/admin/orders', icon: BagIcon },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-cream">
      <Toaster position="top-center" />
      <aside className="hidden w-64 flex-col border-r border-brown-dark/10 bg-brown-dark px-6 py-8 text-ivory lg:flex">
        <Link to="/" className="mb-10 font-display text-xl tracking-widest">
          ELEGANT <span className="text-champagne">ADMIN</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {LINKS.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  isActive ? 'bg-champagne-dark text-ivory' : 'text-ivory/70 hover:bg-ivory/10'
                }`
              }
            >
              <Icon width={17} height={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3 border-t border-ivory/10 pt-6">
          <div className="flex items-center gap-3 text-sm text-ivory/80">
            <UserIcon width={18} height={18} />
            <span className="truncate">{user?.name}</span>
          </div>
          <button onClick={logout} className="text-xs uppercase tracking-widest text-champagne hover:underline">
            Sign Out
          </button>
          <Link to="/" className="block text-xs uppercase tracking-widest text-ivory/60 hover:underline">
            &larr; Back to Store
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-brown-dark/10 bg-ivory px-6 py-4 lg:hidden">
          <Link to="/admin" className="font-display text-lg text-brown-dark">
            Elegant Admin
          </Link>
          <button onClick={logout} className="text-xs uppercase tracking-widest text-champagne-dark">
            Sign Out
          </button>
        </header>
        <main className="p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
