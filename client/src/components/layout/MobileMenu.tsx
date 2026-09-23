import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import Logo from '../ui/Logo';
import { NAV_LINKS } from './Navbar';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

const MobileMenu = () => {
  const { menuOpen, setMenuOpen } = useUI();
  const { user, logout } = useAuth();
  const { count } = useWishlist();
  const close = () => setMenuOpen(false);

  return (
    <Modal open={menuOpen} onClose={close} side="left" label="Menu">
      <div className="flex h-full flex-col px-8 pb-10 pt-6">
        <Logo />
        <nav className="mt-16 flex flex-col gap-2" aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <motion.div key={l.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.8 }}>
              <NavLink to={l.to} end={l.end} onClick={close} className={({ isActive }) => `block py-2 font-serif text-4xl ${isActive ? 'text-ink' : 'text-ink/60'}`}>
                {l.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>
        <div className="mt-auto space-y-4 border-t border-taupe pt-8 font-sans text-[11px] uppercase tracking-wide2">
          <Link to="/wishlist" onClick={close} className="block">
            Wishlist ({count})
          </Link>
          {user ? (
            <>
              <Link to="/account" onClick={close} className="block">
                My account
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={close} className="block text-gold">
                  Admin dashboard
                </Link>
              )}
              <button type="button" onClick={() => { close(); logout(); }} className="block uppercase tracking-wide2 text-stone">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={close} className="block">
              Sign in / Register
            </Link>
          )}
          <Link to="/contact" onClick={close} className="block text-stone">
            Contact
          </Link>
        </div>
      </div>
    </Modal>
  );
};

export default MobileMenu;
