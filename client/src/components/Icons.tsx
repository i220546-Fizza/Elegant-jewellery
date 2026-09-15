import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const HeartIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <svg {...base(props)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
);

export const BagIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 8h12l1 13H5L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const UserIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

export const StarIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <svg {...base(props)} fill={filled ? 'currentColor' : 'none'}>
    <polygon points="12 2 15.09 8.63 22 9.24 16.8 14.14 18.18 21 12 17.4 5.82 21 7.2 14.14 2 9.24 8.91 8.63 12 2" />
  </svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const MinusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const TruckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="1" y="7" width="15" height="10" rx="1" />
    <path d="M16 10h4l3 3v4h-7z" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="19" r="2" />
  </svg>
);

export const ShieldIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z" />
  </svg>
);

export const GiftIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="8" width="18" height="5" rx="1" />
    <path d="M12 8v13M4 13h16v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Z" />
    <path d="M12 8c-2 0-3-1.5-3-3a2 2 0 0 1 4 0c0 1.5-1 3-1 3ZM12 8c2 0 3-1.5 3-3a2 2 0 0 0-4 0" />
  </svg>
);

export const SparkleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 2v5M12 17v5M2 12h5M17 12h5M4.5 4.5l3.5 3.5M16 16l3.5 3.5M19.5 4.5 16 8M8 16l-3.5 3.5" />
  </svg>
);

export const InstagramIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const FacebookIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M15 3h-2a5 5 0 0 0-5 5v2H6v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3Z" />
  </svg>
);

export const TwitterIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M22 5.8a8 8 0 0 1-2.3.6 4 4 0 0 0 1.8-2.2 8 8 0 0 1-2.5 1 4 4 0 0 0-6.9 3.6A11.4 11.4 0 0 1 3.7 4.6a4 4 0 0 0 1.2 5.3A4 4 0 0 1 3 9.2v.05a4 4 0 0 0 3.2 3.9 4 4 0 0 1-1.8.07 4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 17.5a11.4 11.4 0 0 0 6.2 1.8c7.4 0 11.5-6.1 11.5-11.5v-.5A8.2 8.2 0 0 0 22 5.8Z" />
  </svg>
);

export const PinterestIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.5 17c1-3 1.5-5 1.5-5m0 0c-.3-1 0-3 1.8-3 1.4 0 2 1 2 2.2 0 1.5-1 3.8-1.5 4.8-.4.8.2 1.5 1 1.5 1.7 0 3-1.9 3-4.5C17.3 9.6 15.4 8 13 8c-3 0-4.7 2.1-4.7 4.4 0 .8.3 1.6.7 2.1" />
  </svg>
);

export const QuoteIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M9.5 7C6.5 8.5 5 10.8 5 14c0 2.2 1.5 3.5 3.2 3.5A2.8 2.8 0 0 0 11 14.7c0-1.5-1-2.6-2.4-2.8.3-1.5 1.4-2.8 3-3.6L9.5 7ZM18 7c-3 1.5-4.5 3.8-4.5 7 0 2.2 1.5 3.5 3.2 3.5a2.8 2.8 0 0 0 2.8-2.8c0-1.5-1-2.6-2.4-2.8.3-1.5 1.4-2.8 3-3.6L18 7Z" />
  </svg>
);

export const EyeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
