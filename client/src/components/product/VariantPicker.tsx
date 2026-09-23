import type { Variant } from '../../types';
import { discounted, formatPrice } from '../../lib/format';

const VariantPicker = ({ variants, value, onChange, discountPercent = 0 }: { variants: Variant[]; value?: string; onChange: (id: string) => void; discountPercent?: number }) => (
  <div role="radiogroup" aria-label="Size" className="flex flex-wrap gap-3">
    {variants.map((v) => {
      const active = v._id === value;
      const out = v.stock <= 0;
      return (
        <button
          key={v._id}
          type="button"
          role="radio"
          aria-checked={active}
          disabled={out}
          onClick={() => onChange(v._id)}
          className={`relative flex min-w-[104px] flex-col items-start border px-4 py-3 text-left transition-colors duration-500 ${
            active ? 'border-ink bg-ink text-ivory' : 'border-taupe hover:border-gold'
          } ${out ? 'cursor-not-allowed opacity-45' : ''}`}
        >
          <span className="font-sans text-[12px] uppercase tracking-wide2">{v.size}</span>
          <span className={`mt-1 text-xs ${active ? 'text-ivory/70' : 'text-stone'}`}>{out ? 'Sold out' : formatPrice(discounted(v.price, discountPercent))}</span>
          {!out && v.stock <= 3 && <span className={`mt-0.5 text-[10px] ${active ? 'text-gold' : 'text-ink'}`}>Only {v.stock} left</span>}
        </button>
      );
    })}
  </div>
);

export default VariantPicker;
