import { Link, useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';
import ProductImage from '../product/ProductImage';
import Quantity from '../ui/Quantity';

const CartDrawer = () => {
  const { drawerOpen, closeDrawer, quote, refs, setQuantity, removeItem, syncing } = useCart();
  const navigate = useNavigate();
  const lines = quote?.items ?? [];
  const threshold = quote?.freeShippingThreshold ?? 20000;
  const remaining = Math.max(0, threshold - (quote ? quote.subtotal - quote.discount : 0));
  const progress = quote ? Math.min(100, ((quote.subtotal - quote.discount) / threshold) * 100) : 0;
  const go = (to: string) => {
    closeDrawer();
    navigate(to);
  };

  return (
    <Modal open={drawerOpen} onClose={closeDrawer} side="right" label="Shopping bag">
      <div className="flex h-full flex-col">
        <div className="border-b border-taupe px-8 pb-6 pt-7">
          <p className="eyebrow">Your selection</p>
          <h2 className="mt-2 font-serif text-3xl">Shopping Bag</h2>
          {lines.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-stone">{remaining > 0 ? `${formatPrice(remaining)} away from complimentary delivery` : 'Your order qualifies for complimentary delivery'}</p>
              <div className="mt-2 h-px bg-taupe">
                <div className="h-px bg-gold transition-all duration-1000 ease-lux" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-8">
          {refs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="mb-6 block h-12 w-px bg-gold" />
              <p className="font-serif text-2xl">Your bag is empty</p>
              <p className="mt-2 text-sm text-stone">Discover a fragrance to call your own.</p>
              <button type="button" onClick={() => go('/fragrances')} className="btn-dark mt-8">
                Explore fragrances
              </button>
            </div>
          ) : !quote ? (
            <div className="space-y-6 py-8">
              {refs.map((r) => (
                <div key={r.variantId} className="flex gap-4">
                  <div className="skeleton h-28 w-24" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-32" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-taupe/70">
              {lines.map((l) => (
                <li key={l.variantId} className="flex gap-5 py-6">
                  <Link to={`/fragrance/${l.slug}`} onClick={closeDrawer} className="h-28 w-24 shrink-0 bg-taupe/40">
                    <ProductImage src={l.image} alt={l.name} className="h-full w-full object-contain p-1.5" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-serif text-xl leading-tight">{l.name}</p>
                        <p className="mt-1 text-xs text-stone">
                          {l.size} · {l.fragranceFamily}
                        </p>
                      </div>
                      <p className="text-sm">{formatPrice(l.price * l.quantity)}</p>
                    </div>
                    {l.stock < l.requestedQuantity && <p className="mt-1 text-xs text-ink">Only {l.stock} available</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <Quantity small value={l.quantity} max={Math.min(20, l.stock)} onChange={(n) => setQuantity(l.product, l.variantId, n)} />
                      <button type="button" onClick={() => removeItem(l.product, l.variantId)} className="font-sans text-[10px] uppercase tracking-wide2 text-stone underline-offset-4 hover:text-ink hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && quote && (
          <div className="border-t border-taupe bg-white/40 px-8 py-6">
            <div className="flex justify-between text-sm">
              <span className="text-stone">Subtotal</span>
              <span className={syncing ? 'opacity-50' : ''}>{formatPrice(quote.subtotal)}</span>
            </div>
            {quote.discount > 0 && (
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-stone">Discount ({quote.couponCode})</span>
                <span>−{formatPrice(quote.discount)}</span>
              </div>
            )}
            <p className="mt-1 text-xs text-stone">Shipping and discount codes are calculated at checkout.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => go('/cart')} className="btn-outline !px-4">
                View bag
              </button>
              <button type="button" onClick={() => go('/checkout')} className="btn-dark !px-4">
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CartDrawer;
