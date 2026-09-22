import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/menu?category=Cakes', label: 'Cakes' },
  { to: '/menu?category=Desserts', label: 'Desserts' },
  { to: '/about', label: 'About' },
  { to: '/locations', label: 'Locations' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-layers-background/90 shadow-[0_1px_0_var(--layers-border)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" aria-label="Layers Bakeshop home" data-cursor-hover>
          <Logo />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.label}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative text-sm font-medium tracking-wide text-layers-ink transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-layers-accent after:transition-all after:duration-300 hover:text-layers-primary hover:after:w-full ${
                    isActive ? 'text-layers-primary after:w-full' : ''
                  }`
                }
                data-cursor-hover
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(user ? '/account' : '/login')}
            className="hidden rounded-full p-2.5 text-layers-ink transition-colors hover:bg-layers-surface-alt hover:text-layers-primary sm:inline-flex"
            aria-label={user ? 'My account' : 'Log in'}
            data-cursor-hover
          >
            <User size={20} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={openDrawer}
            className="relative rounded-full p-2.5 text-layers-ink transition-colors hover:bg-layers-surface-alt hover:text-layers-primary"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            data-cursor-hover
          >
            <ShoppingBag size={20} strokeWidth={1.75} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-full bg-layers-primary px-1 text-[10px] font-semibold text-white"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-full p-2.5 text-layers-ink hover:bg-layers-surface-alt lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            data-cursor-hover
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-layers-border bg-layers-background lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {links.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-layers-ink hover:bg-layers-surface-alt"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to={user ? '/account' : '/login'}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-layers-primary"
                >
                  {user ? 'My Account' : 'Login / Register'}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
