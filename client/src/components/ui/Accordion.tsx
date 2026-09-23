import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from './Icons';

export const AccordionItem = ({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-taupe/80">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-5 text-left font-sans text-[11px] uppercase tracking-wide2">
        {title}
        <PlusIcon size={16} className={`transition-transform duration-700 ease-lux ${open ? 'rotate-45 text-gold' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pb-6 text-sm leading-relaxed text-stone">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
