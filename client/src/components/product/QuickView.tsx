import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Bottle3D from './Bottle3D';
import VariantPicker from './VariantPicker';
import Quantity from '../ui/Quantity';
import Stars from '../ui/Stars';
import { ArrowRight, HeartIcon } from '../ui/Icons';
import { discounted, formatPrice, genderLabel } from '../../lib/format';

const QuickView = () => {
  const { quickView: p, setQuickView } = useUI();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [variantId, setVariantId] = useState<string>();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (p) {
      setVariantId((p.variants.find((v) => v.size.startsWith('50') && v.stock > 0) || p.variants.find((v) => v.stock > 0) || p.variants[0])?._id);
      setQty(1);
    }
  }, [p]);

  const variant = p?.variants.find((v) => v._id === variantId);
  const close = () => setQuickView(null);

  return (
    <Modal open={!!p} onClose={close} side="center" label={p ? `Quick view: ${p.name}` : 'Quick view'}>
      {p && (
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-taupe/45 md:aspect-auto md:min-h-[560px]">
            <Bottle3D spec={p.bottle} name={p.name} modelUrl={p.model3d} mode="viewer" zoom={0.85} posterClassName="object-contain scale-[0.85]" poster={p.images[0]} posterAlt={p.name} className="absolute inset-0" />
            <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center eyebrow !text-[9px]">Drag to turn</p>
          </div>
          <div className="flex flex-col p-8 sm:p-10">
            <p className="eyebrow">
              {p.fragranceFamily} · {genderLabel[p.gender]}
            </p>
            <h2 className="mt-3 font-serif text-5xl">{p.name}</h2>
            <p className="mt-2 text-sm text-stone">{p.tagline}</p>
            {p.numReviews > 0 && (
              <p className="mt-3 flex items-center gap-2 text-xs text-stone">
                <Stars value={p.rating} /> {p.rating.toFixed(1)} · {p.numReviews} reviews
              </p>
            )}
            <p className="mt-6 text-2xl font-light">{variant && formatPrice(discounted(variant.price, p.discountPercent))}</p>
            <p className="mt-6 line-clamp-4 text-sm leading-relaxed text-stone">{p.description}</p>
            <div className="mt-8">
              <p className="label mb-3">Size</p>
              <VariantPicker variants={p.variants} value={variantId} onChange={setVariantId} discountPercent={p.discountPercent} />
            </div>
            <div className="mt-8 flex gap-3">
              <Quantity value={qty} onChange={setQty} max={Math.min(20, variant?.stock || 1)} />
              <button
                type="button"
                disabled={!variant || variant.stock <= 0}
                onClick={() => {
                  if (variant) {
                    addItem(p, variant, qty);
                    close();
                  }
                }}
                className="btn-dark flex-1"
              >
                Add to bag
              </button>
              <button type="button" onClick={() => toggle(p)} aria-label="Wishlist" className={`flex h-12 w-12 items-center justify-center border border-taupe transition hover:border-gold ${has(p._id) ? 'text-gold' : ''}`}>
                <HeartIcon filled={has(p._id)} />
              </button>
            </div>
            <Link to={`/fragrance/${p.slug}`} onClick={close} className="link-lux mt-8 self-start">
              Discover fragrance <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default QuickView;
