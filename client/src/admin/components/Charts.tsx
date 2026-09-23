import { useMemo, useRef, useState } from 'react';
import { formatPrice, formatShortDate } from '../../lib/format';

/**
 * Revenue over time: a single ink line with a soft champagne area, recessive
 * grid, and a crosshair tooltip. Single series - the panel title names it.
 */
export const RevenueChart = ({ data }: { data: { date: string; total: number; orders: number }[] }) => {
  const W = 760;
  const H = 240;
  const pad = { l: 56, r: 12, t: 12, b: 28 };
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { max, pts, ticks } = useMemo(() => {
    const raw = Math.max(1, ...data.map((d) => d.total));
    const step = Math.pow(10, Math.floor(Math.log10(raw)));
    const niceMax = Math.ceil(raw / step) * step;
    const x = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r);
    const y = (v: number) => pad.t + (1 - v / niceMax) * (H - pad.t - pad.b);
    return { max: niceMax, pts: data.map((d, i) => ({ x: x(i), y: y(d.total), d })), ticks: [0, 0.5, 1].map((f) => ({ v: niceMax * f, y: y(niceMax * f) })) };
  }, [data]);

  if (!data.length) return <p className="py-16 text-center text-sm text-stone">No sales in this period.</p>;

  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
  const area = `${line}L${pts[pts.length - 1].x},${H - pad.b}L${pts[0].x},${H - pad.b}Z`;
  const labelEvery = Math.ceil(data.length / 6);

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  const hp = hover !== null ? pts[hover] : null;
  const compact = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)));

  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" role="img" aria-label={`Revenue for the last ${data.length} days, peaking at ${formatPrice(max)}`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="rev-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9B27C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#C9B27C" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t.v}>
            <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="#D8D0C2" strokeWidth="1" strokeDasharray={t.v === 0 ? '' : '2 4'} />
            <text x={pad.l - 10} y={t.y + 4} textAnchor="end" fontSize="11" fill="#8D8A83" fontFamily="Jost">
              {compact(t.v)}
            </text>
          </g>
        ))}
        {pts.map((p, i) =>
          i % labelEvery === 0 || i === pts.length - 1 ? (
            <text key={p.d.date} x={p.x} y={H - 8} textAnchor="middle" fontSize="11" fill="#8D8A83" fontFamily="Jost">
              {formatShortDate(p.d.date).split(' ').slice(0, 2).join(' ')}
            </text>
          ) : null
        )}
        <path d={area} fill="url(#rev-area)" />
        <path d={line} fill="none" stroke="#0D0E10" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hp && (
          <g>
            <line x1={hp.x} x2={hp.x} y1={pad.t} y2={H - pad.b} stroke="#8D8A83" strokeWidth="1" />
            <circle cx={hp.x} cy={hp.y} r="5" fill="#0D0E10" stroke="#F8F7F3" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute top-0 z-10 min-w-[150px] bg-ink px-3 py-2 text-xs text-ivory shadow-soft"
          style={{ left: `${(hp.x / W) * 100}%`, transform: `translateX(${hp.x / W > 0.7 ? '-105%' : '8%'})` }}
        >
          <p className="text-ivory/60">{formatShortDate(hp.d.date)}</p>
          <p className="mt-1 text-sm">{formatPrice(hp.d.total)}</p>
          <p className="text-ivory/60">
            {hp.d.orders} {hp.d.orders === 1 ? 'order' : 'orders'}
          </p>
        </div>
      )}
    </div>
  );
};

/** Horizontal magnitude bars with the value in text, not colour. */
export const BarList = ({ rows, format = (n: number) => String(n) }: { rows: { label: string; value: number; sub?: string }[]; format?: (n: number) => string }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="group" title={`${r.label}: ${format(r.value)}${r.sub ? ` · ${r.sub}` : ''}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 text-ink">
              {format(r.value)}
              {r.sub && <span className="ml-2 text-xs text-stone">{r.sub}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 bg-taupe/40">
            <div className={`h-2 rounded-r-[4px] transition-all duration-700 ${hover === i ? 'bg-ink' : 'bg-gold'}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};
