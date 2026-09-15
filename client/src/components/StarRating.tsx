import { StarIcon } from './Icons';

interface Props {
  rating: number;
  count?: number;
  size?: number;
}

const StarRating = ({ rating, count, size = 14 }: Props) => (
  <div className="flex items-center gap-1">
    <div className="flex text-champagne">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= Math.round(rating)} width={size} height={size} />
      ))}
    </div>
    {typeof count === 'number' && <span className="text-xs text-brown-light">({count})</span>}
  </div>
);

export default StarRating;
