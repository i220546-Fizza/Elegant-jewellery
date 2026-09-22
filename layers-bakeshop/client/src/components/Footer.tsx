import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ThumbsUp, MapPin, Phone, Mail } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  }

  return (
    <footer className="border-t border-layers-border bg-layers-ink text-white/80">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Layers of joy in every bite. Premium cakes, cupcakes and desserts, baked fresh daily and delivered
              with care across the city.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Layers Bakeshop on Instagram"
                data-cursor-hover
                className="rounded-full border border-white/15 p-2 transition-colors hover:border-layers-accent hover:text-layers-accent"
              >
                <Camera size={17} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Layers Bakeshop on Facebook"
                data-cursor-hover
                className="rounded-full border border-white/15 p-2 transition-colors hover:border-layers-accent hover:text-layers-accent"
              >
                <ThumbsUp size={17} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="layers-eyebrow !text-white/50">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/menu" className="hover:text-layers-accent">Menu</Link></li>
              <li><Link to="/gallery" className="hover:text-layers-accent">Gallery</Link></li>
              <li><Link to="/offers" className="hover:text-layers-accent">Special Offers</Link></li>
              <li><Link to="/about" className="hover:text-layers-accent">Our Story</Link></li>
              <li><Link to="/locations" className="hover:text-layers-accent">Locations</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="layers-eyebrow !text-white/50">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-layers-accent" />
                <span>Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-layers-accent" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-layers-accent" />
                <span>hello@layersbakeshop.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="layers-eyebrow !text-white/50">Newsletter</h3>
            <p className="mt-4 text-sm text-white/60">Get first access to new flavours and seasonal offers.</p>
            {subscribed ? (
              <p className="mt-4 text-sm text-layers-accent">You're on the list — thank you!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-layers-accent focus:outline-none"
                />
                <button
                  type="submit"
                  data-cursor-hover
                  className="shrink-0 rounded-full bg-layers-accent px-4 py-2.5 text-sm font-medium text-layers-ink transition-colors hover:bg-layers-accent-hover"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Layers Bakeshop. All rights reserved.</p>
          <p>Crafted with layers of care.</p>
        </div>
      </div>
    </footer>
  );
}
