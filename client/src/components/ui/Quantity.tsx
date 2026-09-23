import { MinusIcon, PlusIcon } from './Icons';

const Quantity = ({ value, onChange, max = 20, small = false }: { value: number; onChange: (n: number) => void; max?: number; small?: boolean }) => (
  <div className={`inline-flex items-center border border-taupe ${small ? 'h-9' : 'h-12'}`}>
    <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} className="flex h-full w-10 items-center justify-center text-ink transition hover:text-gold disabled:opacity-30">
      <MinusIcon size={14} />
    </button>
    <span className={`w-8 text-center font-sans ${small ? 'text-xs' : 'text-sm'}`} aria-live="polite">
      {value}
    </span>
    <button type="button" aria-label="Increase quantity" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="flex h-full w-10 items-center justify-center text-ink transition hover:text-gold disabled:opacity-30">
      <PlusIcon size={14} />
    </button>
  </div>
);

export default Quantity;
