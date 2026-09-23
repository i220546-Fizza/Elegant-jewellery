import { Link } from 'react-router-dom';

/** Typographic logo: a framed NB monogram beside the stacked house name. */
const Logo = ({ tone = 'ink', compact = false, className = '' }: { tone?: 'ink' | 'ivory'; compact?: boolean; className?: string }) => {
  const text = tone === 'ink' ? 'text-ink' : 'text-ivory';
  return (
    <Link to="/" aria-label="NB Classic Scents home" className={`group inline-flex items-center gap-3 ${text} ${className}`}>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center border border-gold/80 transition-colors duration-700 group-hover:border-gold">
        <span className="absolute inset-[3px] border border-gold/30" />
        <span className="font-serif text-[17px] font-normal leading-none tracking-[0.06em]">NB</span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-[15px] font-normal tracking-[0.34em]">NB</span>
          <span className="mt-1 font-sans text-[8.5px] font-normal tracking-[0.42em] text-current opacity-80">CLASSIC SCENTS</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
