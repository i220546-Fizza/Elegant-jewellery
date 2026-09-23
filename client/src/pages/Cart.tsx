import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PageHeader from '../components/ui/PageHeader';
import ProductImage from '../components/product/ProductImage';
import Quantity from '../components/ui/Quantity';
import CouponForm from '../components/product/CouponForm';
import { Totals } from '../components/product/OrderSummary';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { ArrowLeft } from '../components/ui/Icons';
import { formatPrice } from '../lib/format';
import { useTitle } from '../lib/useTitle';

const Cart = () => {
  useTitle('Shopping Bag');
  const { refs, quote, setQuantity, removeItem, syncing } = useCart();

  return (
    <>
      <PageHeader eyebrow="Your selection" title="Shopping Bag" crumbs={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} />
      <section className="container-lux py-16 lg:py-20">
        {refs.length === 0 ? (
          <EmptyState title="Your bag is empty" text="A signature is waiting to be found." action={{ label: 'Explore fragrances', to: '/fragrances' }} />
        ) : !quote ? (
          <Spinner label="Preparing your bag" />
        ) : (
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="hidden grid-cols-[1fr_140px_120px] border-b border-taupe pb-4 eyebrow md:grid">
                <span>Fragrance</span>
                <span>Quantity</span>
                <span className="text-right">Total</span>
              </div>
              <ul className="divide-y divide-taupe/70">
                {quote.items.map((l) => (
                  <li key={l.variantId} className="grid grid-cols-[96px_1fr] gap-5 py-8 md:grid-cols-[1fr_140px_120px] md:items-center md:gap-0">
                    <div className="flex gap-6 md:items-center">
                      <Link to={`/fragrance/${l.slug}`} className="h-32 w-24 shrink-0 bg-taupe/40">
                        <ProductImage src={l.image} alt={l.name} className="h-full w-full object-contain p-2" />
                      </Link>
                      <div className="hidden md:block">
                        <Link to={`/fragrance/${l.slug}`} className="font-serif text-2xl hover:text-stone">
                          {l.name}
                        </Link>
                        <p className="mt-1 text-xs text-stone">
                          {l.fragranceFamily} · {l.size}
                        </p>
                        <p className="mt-2 text-sm">{formatPrice(l.price)}</p>
                        {l.stock < l.requestedQuantity && <p className="mt-1 text-xs">Only {l.stock} available — quantity adjusted</p>}
                        <button type="button" onClick={() => removeItem(l.product, l.variantId)} className="mt-3 font-sans text-[10px] uppercase tracking-wide2 text-stone hover:text-ink">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="md:hidden">
                      <Link to={`/fragrance/${l.slug}`} className="font-serif text-2xl">
                        {l.name}
                      </Link>
                      <p className="mt-1 text-xs text-stone">
                        {l.size} · {formatPrice(l.price)}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <Quantity small value={l.quantity} max={Math.min(20, l.stock)} onChange={(n) => setQuantity(l.product, l.variantId, n)} />
                        <span className="text-sm">{formatPrice(l.price * l.quantity)}</span>
                      </div>
                      <button type="button" onClick={() => removeItem(l.product, l.variantId)} className="mt-3 font-sans text-[10px] uppercase tracking-wide2 text-stone">
                        Remove
                      </button>
                    </div>
                    <div className="hidden md:block">
                      <Quantity small value={l.quantity} max={Math.min(20, l.stock)} onChange={(n) => setQuantity(l.product, l.variantId, n)} />
                    </div>
                    <p className="hidden text-right md:block">{formatPrice(l.price * l.quantity)}</p>
                  </li>
                ))}
              </ul>
              <Link to="/fragrances" className="link-lux mt-8">
                <ArrowLeft size={14} /> Continue shopping
              </Link>
            </div>

            <aside className="lg:col-span-4">
              <div className={`card-panel p-8 lg:sticky lg:top-28 ${syncing ? 'opacity-70' : ''} transition-opacity`}>
                <p className="font-serif text-3xl">Order summary</p>
                <div className="mt-8">
                  <CouponForm />
                </div>
                <div className="mt-8">
                  <Totals subtotal={quote.subtotal} discount={quote.discount} shipping={quote.shipping} total={quote.total} couponCode={quote.couponCode} />
                </div>
                {quote.shipping > 0 && <p className="mt-4 text-xs text-stone">Add {formatPrice(quote.freeShippingThreshold - (quote.subtotal - quote.discount))} more for complimentary delivery.</p>}
                <Link to="/checkout" className="btn-dark mt-8 w-full">
                  Proceed to checkout
                </Link>
                <p className="mt-4 text-center text-xs text-stone">Cash on delivery · Card · Online payment</p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  );
};

export default Cart;
