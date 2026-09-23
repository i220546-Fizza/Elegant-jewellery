import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { CloseIcon } from '../ui/Icons';

const CouponForm = () => {
  const { couponCode, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  if (couponCode) {
    return (
      <div className="flex items-center justify-between border border-dashed border-gold px-4 py-3 text-sm">
        <span>
          Code <strong className="font-normal tracking-wide2">{couponCode}</strong> applied
        </span>
        <button type="button" onClick={removeCoupon} aria-label="Remove discount code" className="text-stone hover:text-ink">
          <CloseIcon size={14} />
        </button>
      </div>
    );
  }

  // Not a <form>: this sits inside the checkout form, and forms cannot be nested.
  const apply = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    if (await applyCoupon(code)) setCode('');
    setBusy(false);
  };

  return (
    <div className="flex items-end gap-3">
      <label className="flex-1">
        <span className="label">Discount code</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              apply();
            }
          }}
          className="field uppercase tracking-wide2"
          placeholder="Enter code"
        />
      </label>
      <button type="button" onClick={apply} disabled={busy || !code.trim()} className="btn-outline !px-5 !py-3">
        Apply
      </button>
    </div>
  );
};

export default CouponForm;
