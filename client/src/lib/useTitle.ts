import { useEffect } from 'react';

export const useTitle = (title?: string, description?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | NB Classic Scents` : 'NB Classic Scents | The Art of Timeless Fragrance';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
};
