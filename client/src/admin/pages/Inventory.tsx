import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi, productApi } from '../../services';
import { AdminHeader, RowLink, Stat, Table, Td, StockPill } from '../components/ui';
import ProductImage from '../../components/product/ProductImage';
import { ErrorState, Spinner } from '../../components/ui/Feedback';
import { formatPrice } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

type Data = Awaited<ReturnType<typeof adminApi.inventory>>;

const Inventory = () => {
  const [status, setStatus] = useState('all');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(() => {
    setError('');
    adminApi
      .inventory(status)
      .then((d) => {
        setData(d);
        setEdits({});
      })
      .catch((e) => setError(getErrorMessage(e)));
  }, [status]);
  useEffect(load, [load]);

  const saveProduct = async (productId: string, variantIds: string[]) => {
    const variants = variantIds.filter((v) => edits[v] !== undefined).map((v) => ({ _id: v, stock: Number(edits[v]) }));
    if (!variants.length) return;
    setSaving(productId);
    try {
      await productApi.updateStock(productId, variants);
      toast.success('Stock updated');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  return (
    <>
      <AdminHeader eyebrow="Stock" title="Inventory" />
      {data && (
        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <Stat label="Units in stock" value={String(data.summary.totalUnits)} />
          <Stat label="Stock value (retail)" value={formatPrice(data.summary.inventoryValue)} />
          <Stat label="Low-stock sizes" value={String(data.summary.lowStockCount)} />
          <Stat label="Sold-out sizes" value={String(data.summary.outOfStockCount)} />
        </div>
      )}
      <div className="mb-6 flex gap-2" role="tablist">
        {[
          ['all', 'All products'],
          ['low', 'Low stock'],
          ['out', 'Sold out'],
        ].map(([v, l]) => (
          <button key={v} type="button" role="tab" aria-selected={status === v} onClick={() => setStatus(v)} className={`chip ${status === v ? 'border-ink bg-ink text-ivory' : 'border-taupe hover:border-gold'}`}>
            {l}
          </button>
        ))}
      </div>
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data ? (
        <Spinner />
      ) : (
        <Table head={['', 'Fragrance', 'Sold', 'Stock by size (edit to restock)', 'Total', '']} empty={data.products.length === 0}>
          {data.products.map((p) => {
            const dirty = p.variants.some((v) => edits[v._id] !== undefined && Number(edits[v._id]) !== v.stock);
            return (
              <tr key={p._id}>
                <Td>
                  <div className="h-14 w-11 bg-taupe/40">
                    <ProductImage src={p.images[0]} alt="" className="h-full w-full object-contain p-0.5" />
                  </div>
                </Td>
                <Td>
                  <RowLink to={`/admin/products/${p._id}`}>{p.name}</RowLink>
                  <p className="text-xs text-stone">Alert at {p.lowStockThreshold}</p>
                </Td>
                <Td className="text-stone">{p.soldCount}</Td>
                <Td>
                  <div className="flex flex-wrap gap-4">
                    {p.variants.map((v) => (
                      <label key={v._id} className="flex items-center gap-2 text-xs">
                        <span className="w-14 text-stone">{v.size}</span>
                        <input
                          type="number"
                          min={0}
                          className="w-16 border border-taupe bg-white/60 px-2 py-1 text-sm focus:border-ink focus:outline-none"
                          value={edits[v._id] ?? String(v.stock)}
                          onChange={(e) => setEdits((s) => ({ ...s, [v._id]: e.target.value }))}
                          aria-label={`${p.name} ${v.size} stock`}
                        />
                        <StockPill stock={v.stock} threshold={p.lowStockThreshold} />
                      </label>
                    ))}
                  </div>
                </Td>
                <Td>{p.totalStock}</Td>
                <Td className="text-right">
                  <button type="button" disabled={!dirty || saving === p._id} onClick={() => saveProduct(p._id, p.variants.map((v) => v._id))} className="chip border-ink disabled:border-taupe disabled:opacity-40">
                    {saving === p._id ? 'Saving' : 'Save'}
                  </button>
                </Td>
              </tr>
            );
          })}
        </Table>
      )}
    </>
  );
};

export default Inventory;
