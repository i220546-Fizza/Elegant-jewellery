import type { Order } from '../../types';
import { formatDate, formatPrice } from '../../lib/format';
import ProductImage from '../product/ProductImage';
import { Totals } from '../product/OrderSummary';

const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'] as const;

export const StatusBadge = ({ status }: { status: string }) => {
  const tone =
    status === 'Delivered' ? 'bg-ink text-ivory' : status === 'Cancelled' ? 'border border-stone text-stone' : status === 'Shipped' ? 'bg-gold text-ink' : 'border border-ink/60 text-ink';
  return <span className={`inline-block px-2.5 py-1 font-sans text-[9.5px] uppercase tracking-wide2 ${tone}`}>{status}</span>;
};

export const OrderTimeline = ({ order }: { order: Order }) => {
  if (order.status === 'Cancelled') return <p className="text-sm text-stone">This order was cancelled.</p>;
  const current = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  return (
    <ol className="grid grid-cols-5 gap-2">
      {STEPS.map((s, i) => {
        const at = order.statusHistory.find((h) => h.status === s)?.at;
        return (
          <li key={s} className="text-center">
            <span className={`block h-px ${i <= current ? 'bg-gold' : 'bg-taupe'}`} />
            <span className={`mx-auto -mt-[5px] block h-2.5 w-2.5 rounded-full ${i <= current ? 'bg-gold' : 'border border-taupe bg-ivory'}`} />
            <span className={`mt-3 block font-sans text-[9.5px] uppercase tracking-wide2 ${i <= current ? 'text-ink' : 'text-stone'}`}>{s}</span>
            {at && <span className="mt-1 block text-[10px] text-stone">{formatDate(at, { day: 'numeric', month: 'short' })}</span>}
          </li>
        );
      })}
    </ol>
  );
};

export const PaymentNote = ({ order }: { order: Order }) => {
  if (order.paymentMethod === 'Online Payment' && order.paymentStatus === 'Awaiting Transfer') {
    return (
      <div className="border border-dashed border-gold p-5 text-sm leading-relaxed">
        <p className="font-sans text-[11px] uppercase tracking-wide2">Complete your {order.paymentDetails?.provider || 'online'} payment</p>
        <p className="mt-3 text-stone">
          Please transfer <strong className="font-normal text-ink">{formatPrice(order.totalPrice)}</strong> using the reference <strong className="font-normal text-ink">{order.orderNumber}</strong>.
        </p>
        <p className="mt-2 text-stone">
          Our client care team will contact you at {order.customerInfo.phone} with the {order.paymentDetails?.provider || 'payment'} account details. Your order is confirmed as soon as
          the payment is received.
        </p>
      </div>
    );
  }
  return null;
};

const OrderView = ({ order }: { order: Order }) => (
  <div className="space-y-12">
    <OrderTimeline order={order} />
    <PaymentNote order={order} />
    <div className="grid gap-12 md:grid-cols-2">
      <div>
        <p className="label">Items</p>
        <ul className="mt-4 divide-y divide-taupe/70">
          {order.orderItems.map((i) => (
            <li key={i.variantId} className="flex gap-4 py-4">
              <div className="h-20 w-16 shrink-0 bg-taupe/40">
                <ProductImage src={i.image} alt={i.name} className="h-full w-full object-contain p-1" />
              </div>
              <div className="flex flex-1 justify-between gap-3">
                <div>
                  <p className="font-serif text-xl">{i.name}</p>
                  <p className="text-xs text-stone">
                    {i.size} · Qty {i.quantity}
                  </p>
                </div>
                <p className="text-sm">{formatPrice(i.price * i.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Totals subtotal={order.itemsPrice} discount={order.discountPrice} shipping={order.shippingPrice} total={order.totalPrice} couponCode={order.couponCode} />
        </div>
      </div>
      <div className="space-y-8 text-sm">
        <div>
          <p className="label">Delivery to</p>
          <p className="mt-2">{order.customerInfo.name}</p>
          <p className="text-stone">
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </p>
          <p className="mt-1 text-stone">{order.customerInfo.phone}</p>
        </div>
        <div>
          <p className="label">Payment</p>
          <p className="mt-2">{order.paymentMethod}</p>
          <p className="text-stone">
            {order.paymentStatus}
            {order.paymentDetails?.last4 && ` · ${order.paymentDetails.brand} •••• ${order.paymentDetails.last4}`}
          </p>
        </div>
        {order.trackingNumber && (
          <div>
            <p className="label">Tracking number</p>
            <p className="mt-2">{order.trackingNumber}</p>
          </div>
        )}
        {order.orderNotes && (
          <div>
            <p className="label">Notes</p>
            <p className="mt-2 text-stone">{order.orderNotes}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default OrderView;
