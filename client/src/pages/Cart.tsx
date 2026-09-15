import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import QuantitySelector from '../components/QuantitySelector';
import EmptyState from '../components/EmptyState';
import { BagIcon, TrashIcon } from '../components/Icons';

const FREE_SHIPPING_THRESHOLD = 15000;
const SHIPPING_FEE = 350;

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Shopping Bag | Elegant Jewellery';
  }, []);

  const shipping = items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-luxe py-20">
        <EmptyState
          title="Your bag is empty"
          message="Looks like you haven't added any pieces yet. Explore our collections to find something you'll love."
          icon={<BagIcon width={32} height={32} />}
          actionLabel="Continue Shopping"
          actionTo="/shop"
        />
      </div>
    );
  }

  return (
    <div className="container-luxe py-12">
      <h1 className="section-heading mb-10 text-center">Shopping Bag</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product}-${item.size}`}
              className="card-luxe flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <img src={item.image} alt={item.name} className="h-24 w-24 flex-shrink-0 rounded-xl object-cover bg-beige" />
              <div className="flex-1">
                <p className="font-display text-lg text-brown-dark">{item.name}</p>
                {item.size && <p className="text-xs text-brown-light">Size: {item.size}</p>}
                <p className="mt-1 text-sm font-medium text-brown-dark">{formatCurrency(item.price)}</p>
              </div>
              <QuantitySelector
                quantity={item.quantity}
                max={item.stock}
                onChange={(q) => updateQuantity(item.product, item.size, q)}
              />
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <span className="font-medium text-brown-dark">{formatCurrency(item.price * item.quantity)}</span>
                <button
                  aria-label="Remove item"
                  onClick={() => removeFromCart(item.product, item.size)}
                  className="text-brown-light hover:text-red-500"
                >
                  <TrashIcon width={18} height={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card-luxe h-fit p-6">
          <h2 className="font-display text-xl text-brown-dark">Order Summary</h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-brown-light">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brown-light">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-champagne-dark">
                Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
              </p>
            )}
            <div className="border-t border-brown-dark/10 pt-3 flex justify-between text-base font-medium text-brown-dark">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full">
            Proceed to Checkout
          </button>
          <Link to="/shop" className="mt-4 block text-center text-xs uppercase tracking-widest text-champagne-dark hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
