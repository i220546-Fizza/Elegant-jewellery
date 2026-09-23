import { StarIcon } from './Icons';

const Stars = ({ value, size = 12, className = '' }: { value: number; size?: number; className?: string }) => (
  <span className={`inline-flex items-center gap-[2px] text-gold ${className}`} aria-label={`Rated ${value.toFixed(1)} out of 5`}>
    {[0, 1, 2, 3, 4].map((i) => (
      <StarIcon key={i} size={size} amount={Math.max(0, Math.min(1, value - i))} />
    ))}
  </span>
);

export default Stars;
