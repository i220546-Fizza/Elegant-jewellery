import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  message?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionTo?: string;
}

const EmptyState = ({ title, message, icon, actionLabel, actionTo }: Props) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-brown-dark/15 bg-white/50 py-20 px-6 text-center">
    {icon && <div className="text-4xl text-champagne">{icon}</div>}
    <h3 className="font-display text-2xl text-brown-dark">{title}</h3>
    {message && <p className="max-w-sm text-sm text-brown-light">{message}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-secondary mt-2">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
