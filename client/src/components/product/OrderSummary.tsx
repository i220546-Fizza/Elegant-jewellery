import type { ReactNode } from 'react';
import { formatPrice } from '../../lib/format';

export const SummaryRow = ({ label, value, strong = false }: { label: ReactNode; value: ReactNode; strong?: boolean }) => (
  <div className={`flex justify-between gap-4 ${strong ? 'border-t border-taupe pt-4 text-base' : 'text-sm'}`}>
    <span className={strong ? 'font-sans uppercase tracking-wide2 text-[12px]' : 'text-stone'}>{label}</span>
    <span className={strong ? 'text-lg' : ''}>{value}</span>
  </div>
);

export const Totals = ({ subtotal, discount, shipping, total, couponCode }: { subtotal: number; discount: number; shipping: number; total: number; couponCode?: string }) => (
  <div className="space-y-3">
    <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
    {discount > 0 && <SummaryRow label={`Discount${couponCode ? ` (${couponCode})` : ''}`} value={`−${formatPrice(discount)}`} />}
    <SummaryRow label="Shipping" value={shipping === 0 ? 'Complimentary' : formatPrice(shipping)} />
    <SummaryRow strong label="Total" value={formatPrice(total)} />
  </div>
);
