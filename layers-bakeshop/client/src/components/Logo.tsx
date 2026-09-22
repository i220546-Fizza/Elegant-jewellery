interface LogoProps {
  className?: string;
  tone?: 'dark' | 'light';
}

export default function Logo({ className = '', tone = 'dark' }: LogoProps) {
  const textColor = tone === 'light' ? 'text-white' : 'text-layers-ink';
  const subColor = tone === 'light' ? 'text-white/70' : 'text-layers-muted';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M14 40c0-2 8-4 18-4s18 2 18 4-8 6-18 6-18-4-18-6Z" fill="var(--layers-accent)" />
        <path d="M14 30c0-2 8-4 18-4s18 2 18 4-8 5-18 5-18-3-18-5Z" fill="var(--layers-primary-light)" />
        <path d="M14 20c0-2 8-4 18-4s18 2 18 4-8 5-18 5-18-3-18-5Z" fill="var(--layers-primary)" />
        <circle cx="32" cy="12" r="2.2" fill="var(--layers-accent)" />
      </svg>
      <span className="leading-none">
        <span className={`block font-display text-xl tracking-[0.18em] ${textColor}`}>LAYERS</span>
        <span className={`block text-[0.6rem] tracking-[0.35em] uppercase ${subColor}`}>Bakeshop</span>
      </span>
    </div>
  );
}
