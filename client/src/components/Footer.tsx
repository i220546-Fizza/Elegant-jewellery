import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, PinterestIcon, TwitterIcon } from './Icons';

const Footer = () => (
  <footer className="mt-24 border-t border-brown-dark/10 bg-cream">
    <div className="container-luxe grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <span className="font-display text-2xl tracking-[0.1em] text-brown-dark">ELEGANT JEWELLERY</span>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-brown-light">
          Handcrafted jewellery designed for timeless elegance, quality craftsmanship and the modern woman.
          Made to be worn, loved and passed down.
        </p>
        <div className="mt-6 flex gap-4 text-brown-dark">
          <a href="#" aria-label="Instagram" className="hover:text-champagne-dark">
            <InstagramIcon />
          </a>
          <a href="#" aria-label="Facebook" className="hover:text-champagne-dark">
            <FacebookIcon />
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-champagne-dark">
            <TwitterIcon />
          </a>
          <a href="#" aria-label="Pinterest" className="hover:text-champagne-dark">
            <PinterestIcon />
          </a>
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-xs uppercase tracking-widest2 text-champagne-dark">Shop</h4>
        <ul className="space-y-3 text-sm text-brown-light">
          <li><Link to="/shop?category=rings" className="hover:text-champagne-dark">Rings</Link></li>
          <li><Link to="/shop?category=necklaces" className="hover:text-champagne-dark">Necklaces</Link></li>
          <li><Link to="/shop?category=earrings" className="hover:text-champagne-dark">Earrings</Link></li>
          <li><Link to="/shop?category=bracelets" className="hover:text-champagne-dark">Bracelets</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 text-xs uppercase tracking-widest2 text-champagne-dark">Company</h4>
        <ul className="space-y-3 text-sm text-brown-light">
          <li><Link to="/about" className="hover:text-champagne-dark">About Us</Link></li>
          <li><Link to="/contact" className="hover:text-champagne-dark">Contact</Link></li>
          <li><Link to="/profile" className="hover:text-champagne-dark">My Account</Link></li>
          <li><Link to="/cart" className="hover:text-champagne-dark">Shopping Bag</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 text-xs uppercase tracking-widest2 text-champagne-dark">Get in Touch</h4>
        <ul className="space-y-3 text-sm text-brown-light">
          <li>hello@elegantjewellery.com</li>
          <li>+92 300 1234567</li>
          <li>Gulberg III, Lahore, Pakistan</li>
        </ul>
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
