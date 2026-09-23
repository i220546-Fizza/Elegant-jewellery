import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import type { Coupon } from '../../types';
import { AdminHeader, Panel, Table, Td } from '../components/ui';
import { Spinner } from '../../components/ui/Feedback';
import { formatPrice, formatShortDate } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

const EMPTY = { code: '', description: '', type: 'percent' as Coupon['type'], value: 10, minOrder: 0, maxDiscount: 0, usageLimit: 0, expiresAt: '', isActive: true };

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [form, setForm] = useState<typeof EMPTY & { _id?: string }>(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    adminApi.coupons().then(setCoupons).catch((e) => toast.error(getErrorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = { ...form, expiresAt: form.expiresAt || null };
    try {
      if (form._id) await adminApi.updateCoupon(form._id, payload);
      else await adminApi.createCoupon(payload);
      toast.success('Discount code saved');
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c: Coupon) => {
    try {
      await adminApi.updateCoupon(c._id, { isActive: !c.isActive });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Delete code ${c.code}?`)) return;
    await adminApi.deleteCoupon(c._id).catch((err) => toast.error(getErrorMessage(err)));
    load();
  };

  const num = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: Number(e.target.value) });

  return (
    <>
      <AdminHeader eyebrow="Promotions" title="Discount codes" />
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          {!coupons ? (
            <Spinner />
          ) : (
            <Table head={['Code', 'Discount', 'Minimum', 'Used', 'Expires', 'Active', '']} empty={coupons.length === 0}>
              {coupons.map((c) => (
                <tr key={c._id} className={c.isActive ? '' : 'opacity-60'}>
                  <Td>
                    <span className="tracking-wide2">{c.code}</span>
                    <p className="text-xs text-stone">{c.description}</p>
                  </Td>
                  <Td>{c.type === 'percent' ? `${c.value}%${c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ''}` : formatPrice(c.value)}</Td>
                  <Td className="text-stone">{c.minOrder ? formatPrice(c.minOrder) : '—'}</Td>
                  <Td>
                    {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </Td>
                  <Td className="text-stone">{c.expiresAt ? formatShortDate(c.expiresAt) : 'Never'}</Td>
                  <Td>
                    <input type="checkbox" className="h-4 w-4 accent-ink" checked={c.isActive} onChange={() => toggle(c)} aria-label={`Activate ${c.code}`} />
                  </Td>
                  <Td className="whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => setForm({ _id: c._id, code: c.code, description: c.description, type: c.type, value: c.value, minOrder: c.minOrder, maxDiscount: c.maxDiscount, usageLimit: c.usageLimit, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '', isActive: c.isActive })}
                      className="mr-4 font-sans text-[10px] uppercase tracking-wide2 hover:text-gold"
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => remove(c)} className="font-sans text-[10px] uppercase tracking-wide2 text-stone hover:text-ink">
                      Delete
                    </button>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
        <Panel title={form._id ? 'Edit code' : 'New code'}>
          <form onSubmit={save} className="space-y-4">
            <label className="block">
              <span className="label">Code</span>
              <input className="field-box uppercase" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, '') })} />
            </label>
            <label className="block">
              <span className="label">Description</span>
              <input className="field-box" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label">Type</span>
                <select className="field-box" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Coupon['type'] })}>
                  <option value="percent">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </label>
              <label className="block">
                <span className="label">{form.type === 'percent' ? 'Percent' : 'Amount (PKR)'}</span>
                <input className="field-box" type="number" min={1} required value={form.value} onChange={num('value')} />
              </label>
              <label className="block">
                <span className="label">Minimum order</span>
                <input className="field-box" type="number" min={0} value={form.minOrder} onChange={num('minOrder')} />
              </label>
              <label className="block">
                <span className="label">Max discount</span>
                <input className="field-box" type="number" min={0} value={form.maxDiscount} onChange={num('maxDiscount')} placeholder="0 = none" />
              </label>
              <label className="block">
                <span className="label">Usage limit</span>
                <input className="field-box" type="number" min={0} value={form.usageLimit} onChange={num('usageLimit')} />
              </label>
              <label className="block">
                <span className="label">Expires</span>
                <input className="field-box" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={busy} className="btn-dark !py-3">
                Save
              </button>
              {form._id && (
                <button type="button" onClick={() => setForm(EMPTY)} className="btn-outline !py-3">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
};

export default Coupons;
