import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Earrings', to: '/shop?category=earrings' },
  { label: 'Rings', to: '/shop?category=rings' },
  { label: 'Necklaces', to: '/shop?category=necklaces' },
  { label: 'Bracelets', to: '/shop?category=bracelets' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { ids } = useWishlist();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-lux ${
        scrolled ? 'glass-nav shadow-[0_8px_30px_-12px_rgba(92,70,50,0.18)]' : 'bg-ivory/40 backdrop-blur-sm'
      }`}
    >
      <div className="border-b border-brown-dark/10 bg-brown-dark py-2 text-center text-[11px] uppercase tracking-widest2 text-ivory/90">
        Complimentary shipping on orders over Rs. 15,000
      </div>
      <div
        className={`container-luxe flex items-center justify-between transition-all duration-500 ease-lux ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <button
          className="flex items-center lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Link to="/" className="mx-auto lg:mx-0 flex flex-col items-center lg:items-start">
          <span className="font-display text-2xl sm:text-3xl tracking-[0.15em] text-brown-dark">
            ELEGANT <span className="bg-gold-sheen bg-clip-text text-transparent">JEWELLERY</span>
          </span>
          <span className="hidden sm:block text-[10px] uppercase tracking-widest2 text-champagne-dark">
            Timeless &middot; Elegant &middot; Yours
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `gold-line pb-1 text-xs uppercase tracking-widest transition-colors hover:text-champagne-dark ${
                  isActive ? 'text-champagne-dark after:w-full' : 'text-brown-dark/80'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5 text-brown-dark">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="transition-transform duration-300 hover:-translate-y-0.5 hover:text-champagne-dark"
          >
            <SearchIcon />
          </button>
          <Link
            to={user ? '/profile' : '/login'}
            aria-label="Account"
            className="hidden sm:inline-flex transition-transform duration-300 hover:-translate-y-0.5 hover:text-champagne-dark"
          >
            <UserIcon />
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative transition-transform duration-300 hover:-translate-y-0.5 hover:text-champagne-dark"
          >
            <HeartIcon filled={ids.size > 0} />
            <AnimatePresence>
              {ids.size > 0 && (
                <motion.span
                  key={ids.size}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-champagne-dark text-[10px] text-white"
                >
                  {ids.size}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            aria-label="Open cart"
            onClick={openDrawer}
            className="relative transition-transform duration-300 hover:-translate-y-0.5 hover:text-champagne-dark"
          >
            <BagIcon />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-champagne-dark text-[10px] text-white"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-nav overflow-hidden border-t border-brown-dark/10"
          >
            <form onSubmit={handleSearch} className="container-luxe flex items-center gap-3 py-4">
              <SearchIcon className="text-brown-light" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for rings, necklaces, earrings..."
                className="w-full border-none bg-transparent text-base outline-none placeholder:text-brown-light/60"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <CloseIcon className="text-brown-light" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-brown-dark/10 bg-ivory"
          >
            <div className="container-luxe flex flex-col py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-brown-dark/5 py-3 text-sm uppercase tracking-widest text-brown-dark"
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to={user ? '/profile' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm uppercase tracking-widest text-brown-dark"
              >
                {user ? 'My Account' : 'Login / Sign Up'}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
