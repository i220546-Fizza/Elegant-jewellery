import { MinusIcon, PlusIcon } from './Icons';

interface Props {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
  min?: number;
}

const QuantitySelector = ({ quantity, onChange, max = 99, min = 1 }: Props) => (
  <div className="inline-flex items-center rounded-full border border-brown-dark/20">
    <button
      type="button"
      aria-label="Decrease quantity"
      className="flex h-10 w-10 items-center justify-center text-brown-dark transition-colors hover:text-champagne-dark disabled:opacity-30"
      disabled={quantity <= min}
      onClick={() => onChange(Math.max(min, quantity - 1))}
    >
      <MinusIcon width={16} height={16} />
    </button>
    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
    <button
      type="button"
      aria-label="Increase quantity"
      className="flex h-10 w-10 items-center justify-center text-brown-dark transition-colors hover:text-champagne-dark disabled:opacity-30"
      disabled={quantity >= max}
      onClick={() => onChange(Math.min(max, quantity + 1))}
    >
      <PlusIcon width={16} height={16} />
    </button>
  </div>
);

export default QuantitySelector;
