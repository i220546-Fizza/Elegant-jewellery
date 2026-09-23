import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTitle } from '../../lib/useTitle';

export const AdminHeader = ({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: ReactNode }) => {
  useTitle(`${title} · Admin`);
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-taupe pb-6">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
};

export const Panel = ({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={`card-panel p-5 sm:p-6 ${className}`}>
    {(title || action) && (
      <div className="mb-5 flex items-center justify-between gap-4">
        {title && <h2 className="font-sans text-[11px] uppercase tracking-wide2">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);

export const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="card-panel p-5 sm:p-6">
    <p className="eyebrow">{label}</p>
    <p className="mt-3 font-serif text-3xl sm:text-4xl">{value}</p>
    {hint && <p className="mt-1 text-xs text-stone">{hint}</p>}
  </div>
);

export const Table = ({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: boolean }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead>
        <tr className="border-b border-taupe">
          {head.map((h, i) => (
            <th key={i} scope="col" className="whitespace-nowrap px-3 py-3 font-sans text-[10px] font-normal uppercase tracking-wide2 text-stone first:pl-0">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-taupe/60">{children}</tbody>
    </table>
    {empty && <p className="py-10 text-center text-sm text-stone">Nothing to show yet.</p>}
  </div>
);

export const Td = ({ children, className = '' }: { children?: ReactNode; className?: string }) => <td className={`px-3 py-3 align-middle first:pl-0 ${className}`}>{children}</td>;

export const RowLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="underline decoration-taupe underline-offset-4 transition hover:decoration-gold">
    {children}
  </Link>
);

export const Pager = ({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) =>
  pages > 1 ? (
    <div className="mt-6 flex items-center justify-end gap-3 text-xs">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="chip border-taupe disabled:opacity-40">
        Previous
      </button>
      <span className="text-stone">
        Page {page} of {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="chip border-taupe disabled:opacity-40">
        Next
      </button>
    </div>
  ) : null;

export const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-ink' : 'bg-taupe'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-ivory transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
    {label}
  </label>
);

export const StockPill = ({ stock, threshold = 5 }: { stock: number; threshold?: number }) => (
  <span
    className={`inline-block min-w-[44px] px-2 py-0.5 text-center font-sans text-[10.5px] tracking-wide ${
      stock === 0 ? 'bg-ink text-ivory' : stock <= threshold ? 'border border-gold bg-gold/15 text-ink' : 'border border-taupe text-stone'
    }`}
    title={stock === 0 ? 'Out of stock' : stock <= threshold ? 'Low stock' : 'In stock'}
  >
    {stock === 0 ? 'Out' : stock}
  </span>
);
