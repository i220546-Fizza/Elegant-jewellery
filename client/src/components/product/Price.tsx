import { formatPrice, discounted } from '../../lib/format';

const Price = ({ price, discountPercent = 0, from = false, className = '' }: { price: number; discountPercent?: number; from?: boolean; className?: string }) => {
  const final = discounted(price, discountPercent);
  return (
    <span className={`inline-flex items-baseline gap-2 font-sans ${className}`}>
      {from && <span className="text-[10px] uppercase tracking-wide2 text-stone">From</span>}
      <span>{formatPrice(final)}</span>
      {discountPercent > 0 && <span className="text-[0.85em] text-stone line-through">{formatPrice(price)}</span>}
    </span>
  );
};

export default Price;
