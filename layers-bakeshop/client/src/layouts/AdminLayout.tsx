import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Menu, X } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navContent = (
    <>
      <div className="px-6 py-6">
        <Logo />
        <p className="mt-1 text-xs uppercase tracking-widest text-layers-muted">Admin Panel</p>
      </div>
      <nav className="flex-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-layers-primary text-white' : 'text-layers-ink-soft hover:bg-layers-surface-alt'
              }`
            }
          >
            <link.icon size={17} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-layers-border px-6 py-4">
        <p className="text-sm font-medium text-layers-ink">{user?.name}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 text-sm text-layers-muted hover:text-layers-error"
        >
          <LogOut size={15} /> Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-layers-surface-alt md:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-layers-border bg-layers-surface md:flex">
        {navContent}
      </aside>

      <header className="flex items-center justify-between border-b border-layers-border bg-layers-surface px-5 py-4 md:hidden">
        <Logo />
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open admin menu">
          <Menu size={22} />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-layers-overlay" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-64 flex-col bg-layers-surface">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close admin menu"
              className="absolute right-3 top-3"
            >
              <X size={20} />
            </button>
            {navContent}
          </div>
        </div>
      )}

      <main className="flex-1 p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
