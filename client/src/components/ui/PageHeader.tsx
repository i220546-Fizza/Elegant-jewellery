import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Breadcrumbs = ({ items }: { items: { label: string; to?: string }[] }) => (
  <nav aria-label="Breadcrumb" className="font-sans text-[10.5px] uppercase tracking-wide2 text-stone">
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((it, i) => (
        <li key={it.label} className="flex items-center gap-2">
          {it.to ? (
            <Link to={it.to} className="transition hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span className="text-ink" aria-current="page">
              {it.label}
            </span>
          )}
          {i < items.length - 1 && <span className="text-gold">/</span>}
        </li>
      ))}
    </ol>
  </nav>
);

const PageHeader = ({ eyebrow, title, children, crumbs }: { eyebrow?: string; title: ReactNode; children?: ReactNode; crumbs?: { label: string; to?: string }[] }) => (
  <header className="border-b border-taupe/70 pb-14 pt-32 lg:pb-20 lg:pt-44">
    <div className="container-lux">
      {crumbs && <Breadcrumbs items={crumbs} />}
      {eyebrow && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="eyebrow mt-8 flex items-center gap-4">
          <span className="gold-rule" /> {eyebrow}
        </motion.p>
      )}
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }} className="heading-xl mt-5">
        {title}
      </motion.h1>
      {children && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.3, delay: 0.3 }} className="mt-6 max-w-xl text-[15px] leading-relaxed text-stone">
          {children}
        </motion.div>
      )}
    </div>
  </header>
);

export default PageHeader;
