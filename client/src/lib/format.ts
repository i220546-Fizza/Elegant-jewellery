const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

export const formatPrice = (value: number): string => `PKR ${pkr.format(Math.round(value || 0))}`;

export const formatDate = (value: string | Date, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  new Date(value).toLocaleDateString('en-GB', opts);

export const formatShortDate = (value: string | Date) => formatDate(value, { day: 'numeric', month: 'short', year: 'numeric' });

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const genderLabel = { women: "Women's", men: "Men's", unisex: 'Unisex' } as const;

export const discounted = (price: number, discountPercent: number) => Math.round(price * (1 - (discountPercent || 0) / 100));

/** Absolute URL for API-served assets when the API lives on another origin. */
export const assetUrl = (path?: string) => {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  const base = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '') : '';
  return `${base}${path}`;
};
