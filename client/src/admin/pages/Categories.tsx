import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { categoryApi } from '../../services';
import type { Category } from '../../types';
import { AdminHeader, Panel, Table, Td } from '../components/ui';
import { Spinner } from '../../components/ui/Feedback';
import { getErrorMessage } from '../../lib/api';

const EMPTY = { name: '', slug: '', description: '', kind: 'collection' as Category['kind'], order: 0, isActive: true };

const Categories = () => {
  const [cats, setCats] = useState<Category[] | null>(null);
  const [form, setForm] = useState<typeof EMPTY & { _id?: string }>(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    categoryApi.list(true).then(setCats).catch((e) => toast.error(getErrorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (form._id) await categoryApi.update(form._id, form);
      else await categoryApi.create(form);
      toast.success('Category saved');
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: Category) => {
    if (!window.confirm(`Delete "${c.name}"? Products stay, but are removed from this category.`)) return;
    try {
      await categoryApi.remove(c._id);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <AdminHeader eyebrow="Catalogue" title="Categories" />
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          {!cats ? (
            <Spinner />
          ) : (
            <Table head={['Name', 'Slug', 'Type', 'Order', 'Products', 'Visible', '']} empty={cats.length === 0}>
              {cats.map((c) => (
                <tr key={c._id}>
                  <Td>{c.name}</Td>
                  <Td className="text-stone">{c.slug}</Td>
                  <Td className="text-stone">{c.kind === 'audience' ? 'Wearer' : 'Collection'}</Td>
                  <Td>{c.order}</Td>
                  <Td>{c.productCount}</Td>
                  <Td>{c.isActive ? 'Yes' : 'No'}</Td>
                  <Td className="whitespace-nowrap text-right">
                    <button type="button" onClick={() => setForm({ _id: c._id, name: c.name, slug: c.slug, description: c.description, kind: c.kind, order: c.order, isActive: c.isActive })} className="mr-4 font-sans text-[10px] uppercase tracking-wide2 hover:text-gold">
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
        <Panel title={form._id ? 'Edit category' : 'New category'}>
          <form onSubmit={save} className="space-y-4">
            <label className="block">
              <span className="label">Name</span>
              <input className="field-box" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="label">URL slug (optional)</span>
              <input className="field-box" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" />
            </label>
            <label className="block">
              <span className="label">Description</span>
              <textarea className="field-box min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label">Type</span>
                <select className="field-box" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Category['kind'] })}>
                  <option value="collection">Collection</option>
                  <option value="audience">Wearer</option>
                </select>
              </label>
              <label className="block">
                <span className="label">Order</span>
                <input className="field-box" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-ink" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Visible in store
            </label>
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

export default Categories;
