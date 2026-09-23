import { useState } from 'react';
import { assetUrl } from '../../lib/format';

/** Lazy-loaded product image that fades in and degrades to a quiet placeholder. */
const ProductImage = ({ src, alt, className = '', eager = false, sizes }: { src?: string; alt: string; className?: string; eager?: boolean; sizes?: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center ${className}`} aria-label={alt} role="img">
        <span className="font-serif text-4xl tracking-[0.2em] text-stone/40">NB</span>
      </div>
    );
  }
  return (
    <img
      src={assetUrl(src)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      sizes={sizes}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`transition-opacity duration-1000 ease-lux ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
};

export default ProductImage;
