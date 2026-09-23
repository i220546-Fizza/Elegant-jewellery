import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Logo from '../ui/Logo';
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from '../ui/Icons';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/collections', label: 'Collection' },
  { to: '/fragrances', label: 'Fragrances' },
  { to: '/our-story', label: 'Our Story' },
];

const Badge = ({ n }: { n: number }) =>
  n > 0 ? (
    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 font-sans text-[9px] font-normal text-ink">
      {n > 99 ? '99' : n}
    </span>
  ) : null;

const Navbar = () => {
  const { itemCount, openDrawer } = useCart();
  const { count } = useWishlist();
  const { user } = useAuth();
  const { setSearchOpen, setMenuOpen } = useUI();
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 420 && y > prev + 4);
    if (y < prev - 4) setHidden(false);
  });

  useEffect(() => setHidden(false), [pathname]);

  const iconBtn = 'relative p-2 text-ink transition-colors duration-500 hover:text-gold';

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-700 ease-lux ${
        scrolled ? 'bg-ivory/85 shadow-[0_1px_0_rgba(216,208,194,0.9)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className={`container-lux grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-700 ease-lux ${scrolled ? 'h-16' : 'h-20 lg:h-24'}`}>
        <div className="flex items-center gap-2">
          <button type="button" className={`${iconBtn} -ml-2 lg:hidden`} aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </button>
          <Logo className="hidden lg:inline-flex" />
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `group relative py-2 font-sans text-[11px] uppercase tracking-wide2 transition-colors duration-500 ${isActive ? 'text-ink' : 'text-ink/70 hover:text-ink'}`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  <span className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gold transition-transform duration-700 ease-lux ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <Logo compact className="lg:hidden" />

        <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
          <button type="button" className={iconBtn} aria-label="Search" onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </button>
          <Link to={user ? (user.role === 'admin' ? '/account' : '/account') : '/login'} className={`${iconBtn} hidden sm:block`} aria-label={user ? 'My account' : 'Sign in'}>
            <UserIcon />
          </Link>
          <Link to="/wishlist" className={`${iconBtn} hidden sm:block`} aria-label={`Wishlist, ${count} items`}>
            <HeartIcon />
            <Badge n={count} />
          </Link>
          <button type="button" className={`${iconBtn} -mr-2`} aria-label={`Shopping bag, ${itemCount} items`} onClick={openDrawer}>
            <BagIcon />
            <Badge n={itemCount} />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
