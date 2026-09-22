import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, increment, decrement, removeItem, subtotal, deliveryFee, total } =
    useCart();
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer();
    }
    if (isDrawerOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, closeDrawer]);

  function handleCheckout() {
    closeDrawer();
    navigate('/checkout');
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-layers-overlay backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-layers-surface shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-layers-border px-6 py-5">
              <h2 className="font-display text-xl text-layers-ink">Your Bag ({items.length})</h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close cart"
                className="rounded-full p-2 hover:bg-layers-surface-alt"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag size={48} className="text-layers-accent-soft" strokeWidth={1.25} />
                <p className="text-layers-muted">Your bag is empty. Time to add something delicious.</p>
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    navigate('/menu');
                  }}
                  className="rounded-full bg-layers-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-layers-primary-hover"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6 py-4">
                  {items.map((item) => (
                    <motion.li
                      key={`${item.product}-${item.size ?? ''}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      className="mb-4 flex gap-3 border-b border-layers-border pb-4 last:border-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        loading="lazy"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-layers-ink">{item.name}</p>
                            {item.size && <p className="text-xs text-layers-muted">{item.size}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product, item.size)}
                            aria-label={`Remove ${item.name}`}
                            className="text-layers-muted hover:text-layers-error"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-layers-border px-1">
                            <button
                              type="button"
                              onClick={() => decrement(item.product, item.size)}
                              aria-label="Decrease quantity"
                              className="rounded-full p-1.5 hover:bg-layers-surface-alt"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-5 text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => increment(item.product, item.size)}
                              aria-label="Increase quantity"
                              disabled={item.quantity >= item.stock}
                              className="rounded-full p-1.5 hover:bg-layers-surface-alt disabled:opacity-30"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="font-medium text-layers-ink">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>

                <div className="border-t border-layers-border px-6 py-5">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-layers-ink-soft">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-layers-ink-soft">
                      <span>Delivery</span>
                      <span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-base font-semibold text-layers-ink">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="mt-4 w-full rounded-full bg-layers-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-layers-primary-hover"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
