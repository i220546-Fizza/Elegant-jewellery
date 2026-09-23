import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/account', label: 'Profile', end: true },
  { to: '/account/orders', label: 'Orders' },
  { to: '/account/wishlist', label: 'Wishlist' },
  { to: '/account/addresses', label: 'Addresses' },
  { to: '/account/security', label: 'Password' },
];

const AccountLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="pb-24 pt-28 lg:pt-40">
      <div className="container-lux">
        <p className="eyebrow">My account</p>
        <h1 className="mt-3 font-serif text-5xl sm:text-6xl">Welcome, {user?.name.split(' ')[0]}</h1>
        <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Account" className="no-scrollbar -mx-5 flex gap-6 overflow-x-auto border-b border-taupe px-5 pb-3 lg:mx-0 lg:flex-col lg:gap-4 lg:border-b-0 lg:border-r lg:px-0 lg:pb-0">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `shrink-0 font-sans text-[11px] uppercase tracking-wide2 transition ${isActive ? 'text-ink' : 'text-stone hover:text-ink'}`}>
                {({ isActive }) => (
                  <span className="flex items-center gap-3">
                    <span className={`hidden h-px bg-gold transition-all duration-700 lg:block ${isActive ? 'w-6' : 'w-0'}`} />
                    {l.label}
                  </span>
                )}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className="shrink-0 font-sans text-[11px] uppercase tracking-wide2 text-gold">
                Admin dashboard
              </NavLink>
            )}
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="shrink-0 text-left font-sans text-[11px] uppercase tracking-wide2 text-stone hover:text-ink lg:mt-6"
            >
              Sign out
            </button>
          </nav>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
