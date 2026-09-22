import type { OrderStatus } from '../types';

const styles: Record<OrderStatus, string> = {
  Pending: 'bg-layers-warning/15 text-layers-warning',
  Confirmed: 'bg-layers-accent-soft text-layers-accent-hover',
  Preparing: 'bg-layers-primary-light/15 text-layers-primary',
  'Out for Delivery': 'bg-layers-primary/15 text-layers-primary',
  Delivered: 'bg-layers-success/15 text-layers-success',
  Cancelled: 'bg-layers-error/15 text-layers-error',
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>
  );
}
