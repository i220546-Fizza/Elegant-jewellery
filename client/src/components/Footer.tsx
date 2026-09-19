import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, PinterestIcon, TwitterIcon } from './Icons';

const Footer = () => (
  <footer className="relative mt-24 overflow-hidden border-t border-champagne/20 bg-cream">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-sheen" />

    <div className="container-luxe grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <span className="font-display text-2xl tracking-[0.1em] text-brown-dark">
          ELEGANT <span className="bg-gold-sheen bg-clip-text text-transparent">JEWELLERY</span>
        </span>
        <p className="mt-3 font-display text-sm italic text-champagne-dark">Timeless elegance for every occasion.</p>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-brown-light">
          Handcrafted jewellery designed for timeless elegance, quality craftsmanship and the modern woman.
          Made to be worn, loved and passed down.
        </p>
        <div className="mt-6 flex gap-4 text-brown-dark">
          <a href="#" aria-label="Instagram" className="transition-transform hover:-translate-y-0.5 hover:text-champagne-dark">
            <InstagramIcon />
          </a>
          <a href="#" aria-label="Facebook" className="transition-transform hover:-translate-y-0.5 hover:text-champagne-dark">
            <FacebookIcon />
          </a>
          <a href="#" aria-label="Twitter" className="transition-transform hover:-translate-y-0.5 hover:text-champagne-dark">
            <TwitterIcon />
          </a>
          <a href="#" aria-label="Pinterest" className="transition-transform hover:-translate-y-0.5 hover:text-champagne-dark">
            <PinterestIcon />
          </a>
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-xs uppercase tracking-widest2 text-champagne-dark">Shop</h4>
        <ul className="space-y-3 text-sm text-brown-light">
          <li><Link to="/shop" className="gold-line hover:text-champagne-dark">All Jewellery</Link></li>
          <li><Link to="/shop?category=rings" className="gold-line hover:text-champagne-dark">Rings</Link></li>
          <li><Link to="/shop?category=necklaces" className="gold-line hover:text-champagne-dark">Necklaces</Link></li>
          <li><Link to="/shop?category=earrings" className="gold-line hover:text-champagne-dark">Earrings</Link></li>
          <li><Link to="/shop?category=bracelets" className="gold-line hover:text-champagne-dark">Bracelets</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 text-xs uppercase tracking-widest2 text-champagne-dark">Company</h4>
        <ul className="space-y-3 text-sm text-brown-light">
          <li><Link to="/about" className="gold-line hover:text-champagne-dark">About</Link></li>
          <li><Link to="/contact" className="gold-line hover:text-champagne-dark">Contact</Link></li>
          <li><Link to="/profile" className="gold-line hover:text-champagne-dark">My Account</Link></li>
          <li><Link to="/cart" className="gold-line hover:text-champagne-dark">Shopping Bag</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 text-xs uppercase tracking-widest2 text-champagne-dark">Help</h4>
        <ul className="space-y-3 text-sm text-brown-light">
          <li><Link to="/contact#faq" className="gold-line hover:text-champagne-dark">FAQ</Link></li>
          <li><Link to="/shipping" className="gold-line hover:text-champagne-dark">Shipping</Link></li>
          <li><Link to="/returns" className="gold-line hover:text-champagne-dark">Returns</Link></li>
          <li><Link to="/privacy" className="gold-line hover:text-champagne-dark">Privacy Policy</Link></li>
        </ul>
        <div className="mt-6 space-y-2 text-sm text-brown-light">
          <p>elegantjewellery84@gmail.com</p>
        </div>
      </div>
    </div>

    <div className="border-t border-brown-dark/10 py-6">
      <p className="container-luxe text-center text-xs text-brown-light">
        &copy; {new Date().getFullYear()} Elegant Jewellery. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
