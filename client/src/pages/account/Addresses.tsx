import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { accountApi } from '../../services';
import type { Address } from '../../types';
import { getErrorMessage } from '../../lib/api';
import { useTitle } from '../../lib/useTitle';

const EMPTY: Address = { label: 'Home', fullName: '', phone: '', address: '', city: '', postalCode: '', country: 'Pakistan', isDefault: false };

const Addresses = () => {
  useTitle('Saved addresses');
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState<Address | null>(null);
  const [busy, setBusy] = useState(false);
  const addresses = user?.addresses ?? [];

  const commit = (list: Address[]) => user && setUser({ ...user, addresses: list });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      commit(editing._id ? await accountApi.updateAddress(editing._id, editing) : await accountApi.addAddress(editing));
      setEditing(null);
      toast.success('Address saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      commit(await accountApi.deleteAddress(id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const makeDefault = async (id: string) => {
    try {
      commit(await accountApi.updateAddress(id, { isDefault: true }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => setEditing((a) => (a ? { ...a, [k]: e.target.value } : a));

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl">Saved addresses</h2>
        {!editing && (
          <button type="button" onClick={() => setEditing({ ...EMPTY, fullName: user?.name || '', phone: user?.phone || '' })} className="btn-outline !py-3">
            Add address
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={save} className="card-panel mt-8 grid gap-8 p-6 sm:grid-cols-2 sm:p-8">
          <label className="block">
            <span className="label">Label</span>
            <input className="field" value={editing.label} onChange={set('label')} placeholder="Home, Office…" />
          </label>
          <label className="block">
            <span className="label">Full name</span>
            <input className="field" required value={editing.fullName} onChange={set('fullName')} />
          </label>
          <label className="block sm:col-span-2">
            <span className="label">Address</span>
            <input className="field" required value={editing.address} onChange={set('address')} />
          </label>
          <label className="block">
            <span className="label">City</span>
            <input className="field" required value={editing.city} onChange={set('city')} />
          </label>
          <label className="block">
            <span className="label">Postal code</span>
            <input className="field" required value={editing.postalCode} onChange={set('postalCode')} />
          </label>
          <label className="block">
            <span className="label">Country</span>
            <input className="field" required value={editing.country} onChange={set('country')} />
          </label>
          <label className="block">
            <span className="label">Phone</span>
            <input className="field" required value={editing.phone} onChange={set('phone')} />
          </label>
          <label className="flex items-center gap-3 text-sm text-stone sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 accent-ink" checked={!!editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} />
            Use as my default address
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={busy} className="btn-dark">
              {busy ? 'Saving…' : 'Save address'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !editing ? (
        <p className="mt-10 text-sm text-stone">You have no saved addresses yet. Addresses you use at checkout can be saved here for next time.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a._id} className={`card-panel p-6 ${a.isDefault ? '!border-ink' : ''}`}>
              <div className="flex items-center justify-between">
                <p className="font-sans text-[11px] uppercase tracking-wide2">{a.label}</p>
                {a.isDefault && <span className="font-sans text-[9.5px] uppercase tracking-wide2 text-gold">Default</span>}
              </div>
              <p className="mt-4 text-sm">{a.fullName}</p>
              <p className="text-sm text-stone">
                {a.address}
                <br />
                {a.city} {a.postalCode}, {a.country}
                <br />
                {a.phone}
              </p>
              <div className="mt-5 flex gap-5 font-sans text-[10.5px] uppercase tracking-wide2 text-stone">
                <button type="button" onClick={() => setEditing(a)} className="hover:text-ink">
                  Edit
                </button>
                {!a.isDefault && (
                  <button type="button" onClick={() => makeDefault(a._id!)} className="hover:text-ink">
                    Make default
                  </button>
                )}
                <button type="button" onClick={() => remove(a._id!)} className="hover:text-ink">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Addresses;
