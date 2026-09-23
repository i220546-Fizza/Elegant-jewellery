import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../ui/Logo';
import { accountApi } from '../../services';
import { getErrorMessage } from '../../lib/api';
import { ArrowRight, FacebookIcon, InstagramIcon, PinterestIcon, TikTokIcon } from '../ui/Icons';

const COLUMNS = [
  {
    title: 'Maison',
    links: [
      { to: '/fragrances', label: 'Shop' },
      { to: '/collections', label: 'Collections' },
      { to: '/our-story', label: 'Our Story' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Client Care',
    links: [
      { to: '/faq', label: 'FAQ' },
      { to: '/shipping', label: 'Shipping' },
      { to: '/returns', label: 'Returns' },
      { to: '/track-order', label: 'Track an order' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms' },
    ],
  },
];

const SOCIAL = [
  { label: 'Instagram', Icon: InstagramIcon, href: 'https://www.instagram.com/' },
  { label: 'Facebook', Icon: FacebookIcon, href: 'https://www.facebook.com/' },
  { label: 'TikTok', Icon: TikTokIcon, href: 'https://www.tiktok.com/' },
  { label: 'Pinterest', Icon: PinterestIcon, href: 'https://www.pinterest.com/' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      toast.success(await accountApi.subscribe(email));
      setDone(true);
      setEmail('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-ink text-ivory">
      <div className="container-lux py-20 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo tone="ivory" />
            <p className="mt-10 font-serif text-4xl font-light uppercase leading-[1.05] tracking-[0.04em] sm:text-5xl">
              Timeless scents.
              <br />
              <span className="text-gold">Unforgettable</span> impressions.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow !text-ivory/60">Enter the world of NB Classic Scents</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/60">Private previews of new creations, limited editions and invitations — sent rarely, and only when it matters.</p>
            {done ? (
              <p className="mt-8 font-serif text-2xl text-gold">Thank you. You are on the list.</p>
            ) : (
              <form onSubmit={subscribe} className="mt-8 flex max-w-lg items-end gap-4 border-b border-ivory/30 pb-2 focus-within:border-gold">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-transparent py-2 font-sans text-[15px] font-light text-ivory placeholder:text-ivory/40 focus:outline-none"
                />
                <button type="submit" disabled={busy} className="flex shrink-0 items-center gap-2 pb-2 font-sans text-[11px] uppercase tracking-wide2 text-gold transition hover:text-ivory disabled:opacity-50">
                  Subscribe <ArrowRight size={14} />
                </button>
              </form>
            )}

            <div className="mt-16 grid grid-cols-2 gap-10 sm:grid-cols-3">
              {COLUMNS.map((c) => (
                <div key={c.title}>
                  <p className="eyebrow !text-ivory/45">{c.title}</p>
                  <ul className="mt-5 space-y-3">
                    {c.links.map((l) => (
                      <li key={l.to}>
                        <Link to={l.to} className="text-sm text-ivory/80 transition-colors duration-500 hover:text-gold">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col-reverse items-start justify-between gap-8 border-t border-ivory/15 pt-8 sm:flex-row sm:items-center">
          <p className="font-sans text-[10.5px] uppercase tracking-wide2 text-ivory/45">© {new Date().getFullYear()} NB Classic Scents. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {SOCIAL.map(({ label, Icon, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer noopener" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-ivory/80 transition-colors duration-500 hover:border-gold hover:text-gold">
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap text-center font-serif text-[17.5vw] font-light leading-[0.75] tracking-[0.06em] text-ivory/[0.04]">
        NB CLASSIC
      </p>
    </footer>
  );
};

export default Footer;
