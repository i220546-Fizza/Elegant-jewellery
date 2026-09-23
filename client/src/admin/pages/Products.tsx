import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productApi, type ProductPage } from '../../services';
import { AdminHeader, Pager, RowLink, Table, Td, StockPill } from '../components/ui';
import ProductImage from '../../components/product/ProductImage';
import { ErrorState, Spinner } from '../../components/ui/Feedback';
import { formatPrice } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

const Products = () => {
  const [data, setData] = useState<ProductPage | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setError('');
    productApi
      .list({ all: true, search: search || undefined, page, limit: 20, sort: 'name-asc' })
      .then(setData)
      .catch((e) => setError(getErrorMessage(e)));
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? Its reviews will also be removed. Existing orders are kept.`)) return;
    try {
      await productApi.remove(id);
      toast.success(`${name} deleted`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await productApi.update(id, { isActive });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <AdminHeader
        eyebrow="Catalogue"
        title="Products"
        actions={
          <Link to="/admin/products/new" className="btn-dark !py-3">
            Add product
          </Link>
        }
      />
      <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, note or family" className="field-box mb-6 max-w-md" aria-label="Search products" />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data ? (
        <Spinner />
      ) : (
        <>
          <Table head={['', 'Fragrance', 'Family', 'Sizes & stock', 'From', 'Discount', 'Visible', '']} empty={data.products.length === 0}>
            {data.products.map((p) => (
              <tr key={p._id} className={p.isActive ? '' : 'opacity-60'}>
                <Td>
                  <div className="h-14 w-11 bg-taupe/40">
                    <ProductImage src={p.images[0]} alt="" className="h-full w-full object-contain p-0.5" />
                  </div>
                </Td>
                <Td>
                  <RowLink to={`/admin/products/${p._id}`}>
                    <span className="font-serif text-lg">{p.name}</span>
                  </RowLink>
                  <p className="text-xs text-stone">{p.categories.map((c) => c.name).join(', ')}</p>
                </Td>
                <Td className="text-stone">{p.fragranceFamily}</Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    {p.variants.map((v) => (
                      <span key={v._id} className="flex items-center gap-1.5 text-xs text-stone">
                        {v.size} <StockPill stock={v.stock} threshold={p.lowStockThreshold} />
                      </span>
                    ))}
                  </div>
                </Td>
                <Td className="whitespace-nowrap">{formatPrice(p.price)}</Td>
                <Td>{p.discountPercent ? `${p.discountPercent}%` : '—'}</Td>
                <Td>
                  <input type="checkbox" className="h-4 w-4 accent-ink" checked={p.isActive} onChange={(e) => toggleActive(p._id, e.target.checked)} aria-label={`Show ${p.name} in the store`} />
                </Td>
                <Td className="whitespace-nowrap text-right">
                  <Link to={`/admin/products/${p._id}`} className="mr-4 font-sans text-[10px] uppercase tracking-wide2 hover:text-gold">
                    Edit
                  </Link>
                  <button type="button" onClick={() => remove(p._id, p.name)} className="font-sans text-[10px] uppercase tracking-wide2 text-stone hover:text-ink">
                    Delete
                  </button>
                </Td>
              </tr>
            ))}
          </Table>
          <Pager page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </>
  );
};

export default Products;
