import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: string;
}

const StatCard = ({ label, value, icon, accent = 'text-champagne-dark' }: Props) => (
  <div className="card-luxe flex items-center gap-4 p-6">
    <span className={`flex h-12 w-12 items-center justify-center rounded-full bg-champagne/15 ${accent}`}>
      {icon}
    </span>
    <div>
      <p className="text-xs uppercase tracking-widest text-brown-light">{label}</p>
      <p className="font-display text-2xl text-brown-dark">{value}</p>
    </div>
  </div>
);

export default StatCard;
