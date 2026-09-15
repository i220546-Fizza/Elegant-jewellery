import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../../types';
import { fetchProducts, deleteProduct } from '../../services/productService';
import { getErrorMessage } from '../../services/api';
import { formatCurrency, categoryLabel } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { GiftIcon, PlusIcon, TrashIcon } from '../../components/Icons';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = () => {
    setLoading(true);
    fetchProducts({ limit: 48 })
      .then((res) => setProducts(res.products))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Manage Products | Elegant Jewellery Admin';
    loadProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-brown-dark">Products</h1>
          <p className="mt-1 text-sm text-brown-light">Manage your catalog of {products.length} products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <PlusIcon width={16} height={16} /> Add Product
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading products" />
      ) : products.length === 0 ? (
        <EmptyState title="No products yet" message="Add your first product to get started." icon={<GiftIcon width={28} height={28} />} />
      ) : (
        <div className="card-luxe overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-brown-dark/10 text-left text-xs uppercase tracking-widest text-brown-light">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Flags</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-brown-dark/5 last:border-none">
                  <td className="flex items-center gap-3 p-4">
                    <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-lg bg-beige object-cover" />
                    <span className="text-brown-dark">{p.name}</span>
                  </td>
                  <td className="p-4 text-brown-light">{categoryLabel(p.category)}</td>
                  <td className="p-4 text-brown-dark">{formatCurrency(p.price)}</td>
                  <td className="p-4">
                    <span className={p.stock <= 5 ? 'font-medium text-red-500' : 'text-brown-dark'}>{p.stock}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {p.featured && <span className="rounded-full bg-champagne/20 px-2 py-0.5 text-[10px] text-champagne-dark">Featured</span>}
                      {p.bestseller && <span className="rounded-full bg-brown-dark/10 px-2 py-0.5 text-[10px] text-brown-dark">Bestseller</span>}
                      {p.isNewArrival && <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] text-brown-dark">New</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/products/${p._id}/edit`} className="text-xs uppercase tracking-widest text-champagne-dark hover:underline">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={deletingId === p._id}
                        className="text-brown-light hover:text-red-500"
                        aria-label="Delete product"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
