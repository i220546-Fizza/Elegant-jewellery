import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import QuantitySelector from './QuantitySelector';
import { BagIcon, CloseIcon, TrashIcon } from './Icons';

const FREE_SHIPPING_THRESHOLD = 15000;
const SHIPPING_FEE = 350;

const CartDrawer = () => {
  const { items, updateQuantity, removeFromCart, subtotal, isDrawerOpen, closeDrawer } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDrawerOpen) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  const shipping = items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const goToCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[110] bg-brown-dark/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className="glass fixed right-0 top-0 z-[120] flex h-full w-full max-w-md flex-col bg-ivory/95 shadow-lux"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between border-b border-brown-dark/10 px-6 py-5">
              <h2 className="font-display text-xl text-brown-dark">Your Bag ({items.length})</h2>
              <button aria-label="Close bag" onClick={closeDrawer} className="text-brown-dark hover:text-champagne-dark">
                <CloseIcon />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <BagIcon width={32} height={32} className="text-champagne" />
                <p className="text-brown-light">Your bag is empty.</p>
                <Link to="/shop" onClick={closeDrawer} className="btn-secondary">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product}-${item.size}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4"
                    >
                      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl bg-beige object-cover shadow-card" />
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="font-display text-sm text-brown-dark">{item.name}</p>
                        {item.size && <p className="text-xs text-brown-light">Size: {item.size}</p>}
                        <p className="text-sm font-medium text-champagne-dark">{formatCurrency(item.price)}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <QuantitySelector
                            quantity={item.quantity}
                            max={item.stock}
                            onChange={(q) => updateQuantity(item.product, item.size, q)}
                          />
                          <button
                            aria-label="Remove item"
                            onClick={() => removeFromCart(item.product, item.size)}
                            className="text-brown-light hover:text-red-500"
                          >
                            <TrashIcon width={16} height={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-brown-dark/10 px-6 py-6">
                  <div className="flex justify-between text-sm text-brown-light">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-brown-light">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between border-t border-brown-dark/10 pt-3 text-base font-medium text-brown-dark">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <button onClick={goToCheckout} className="btn-gold w-full">
                    Proceed to Checkout
                  </button>
                  <Link
                    to="/cart"
                    onClick={closeDrawer}
                    className="block text-center text-xs uppercase tracking-widest text-champagne-dark hover:underline"
                  >
                    View Full Bag
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
