import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export const Spinner = ({ label = 'Loading' }: { label?: string }) => (
  <div role="status" className="flex flex-col items-center justify-center gap-4 py-24">
    <span className="relative block h-px w-24 overflow-hidden bg-taupe">
      <span className="absolute inset-y-0 left-0 w-1/3 animate-[shimmer_1.6s_linear_infinite] bg-gold" style={{ animationName: 'nbslide' }} />
    </span>
    <span className="eyebrow">{label}</span>
    <style>{'@keyframes nbslide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}'}</style>
  </div>
);

export const EmptyState = ({ title, text, action }: { title: string; text?: string; action?: { label: string; to: string } }) => (
  <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
    <span className="mb-8 block h-16 w-px bg-gold" />
    <h3 className="font-serif text-3xl">{title}</h3>
    {text && <p className="mt-3 text-sm leading-relaxed text-stone">{text}</p>}
    {action && (
      <Link to={action.to} className="btn-dark mt-10">
        {action.label}
      </Link>
    )}
  </div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div role="alert" className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
    <p className="eyebrow mb-4">Something went wrong</p>
    <p className="font-serif text-2xl">{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-outline mt-8">
        Try again
      </button>
    )}
  </div>
);

export const SectionHeader = ({ eyebrow, title, children, align = 'left' }: { eyebrow: string; title: ReactNode; children?: ReactNode; align?: 'left' | 'center' }) => (
  <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
    <p className={`eyebrow flex items-center gap-4 ${align === 'center' ? 'justify-center' : ''}`}>
      <span className="gold-rule" />
      {eyebrow}
    </p>
    <h2 className="heading-xl mt-6">{title}</h2>
    {children && <div className="mt-6 text-[15px] leading-relaxed text-stone">{children}</div>}
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => <div className={`skeleton ${className}`} />;
