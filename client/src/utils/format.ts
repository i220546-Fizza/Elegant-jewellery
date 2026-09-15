export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string | Date): string =>
  new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const categoryLabel = (category: string): string =>
  category.charAt(0).toUpperCase() + category.slice(1);
