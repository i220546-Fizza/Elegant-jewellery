import { useMemo, useState } from 'react';
import { MapPin, Clock, Phone, Search } from 'lucide-react';
import Reveal from '../components/Reveal';
import StateMessage from '../components/StateMessage';

const branches = [
  { city: 'Lahore', name: 'Gulberg III', address: 'MM Alam Road, Gulberg III, Lahore', hours: '10:00 AM – 11:00 PM', phone: '+92 300 1234567' },
  { city: 'Lahore', name: 'DHA Phase 5', address: 'Y-Block Commercial, DHA Phase 5, Lahore', hours: '10:00 AM – 11:00 PM', phone: '+92 300 1234568' },
  { city: 'Karachi', name: 'Clifton', address: 'Block 5, Clifton, Karachi', hours: '11:00 AM – 12:00 AM', phone: '+92 300 1234569' },
  { city: 'Karachi', name: 'DHA Phase 2', address: 'Khayaban-e-Shahbaz, DHA Phase 2, Karachi', hours: '11:00 AM – 12:00 AM', phone: '+92 300 1234570' },
  { city: 'Islamabad', name: 'F-7 Markaz', address: 'Jinnah Super Market, F-7, Islamabad', hours: '10:00 AM – 11:00 PM', phone: '+92 300 1234571' },
];

export default function Locations() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return branches;
    const q = query.toLowerCase();
    return branches.filter((b) => b.city.toLowerCase().includes(q) || b.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <Reveal>
        <p className="layers-eyebrow">Find Us</p>
        <h1 className="mt-3 font-display text-4xl text-layers-ink sm:text-5xl">Our Locations</h1>
        <p className="mt-3 max-w-lg text-layers-muted">Search by city to find your nearest Layers Bakeshop branch.</p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="relative mt-8 max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-layers-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city..."
            aria-label="Search branches by city"
            className="w-full rounded-full border border-layers-border bg-layers-surface py-2.5 pl-10 pr-4 text-sm focus:border-layers-primary focus:outline-none"
          />
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <StateMessage icon={MapPin} title="No branches found" description="Try searching a different city." />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((branch, i) => (
            <Reveal key={branch.name} delay={Math.min(i, 5) * 0.06}>
              <div className="h-full rounded-2xl border border-layers-border bg-layers-surface p-6">
                <div className="flex h-32 items-center justify-center rounded-xl bg-layers-surface-alt text-xs uppercase tracking-widest text-layers-muted">
                  Map Placeholder
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-layers-accent-hover">
                  {branch.city}
                </p>
                <h3 className="mt-1 font-display text-xl text-layers-ink">{branch.name}</h3>
                <div className="mt-3 space-y-2 text-sm text-layers-ink-soft">
                  <p className="flex items-start gap-2">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-layers-primary" /> {branch.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={15} className="shrink-0 text-layers-primary" /> {branch.hours}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={15} className="shrink-0 text-layers-primary" /> {branch.phone}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
