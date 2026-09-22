import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Cookie } from 'lucide-react';
import StateMessage from '../../components/StateMessage';
import ProductFormModal from '../../components/admin/ProductFormModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { formatCurrency } from '../../utils/format';
import type { Product } from '../../types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  function load() {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setModalOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    if (editing) {
      await updateProduct(editing._id, formData);
    } else {
      await createProduct(formData);
    }
    setModalOpen(false);
    load();
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await deleteProduct(product._id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-layers-ink">Products</h1>
          <p className="mt-1 text-sm text-layers-muted">{products.length} items in your menu.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-full bg-layers-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-layers-primary-hover"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-layers-border bg-layers-surface">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-layers-surface-alt" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <StateMessage icon={Cookie} title="No products yet" description="Add your first product to get started." action={{ label: 'Add Product', onClick: openAdd }} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-layers-border text-xs uppercase tracking-wider text-layers-muted">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-layers-border last:border-0">
                    <td className="flex items-center gap-3 px-5 py-3">
                      <img src={product.images[0]} alt="" className="h-11 w-11 rounded-lg object-cover" />
                      <span className="font-medium text-layers-ink">{product.name}</span>
                    </td>
                    <td className="px-5 py-3 text-layers-ink-soft">{product.category}</td>
                    <td className="px-5 py-3 text-layers-ink-soft">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-3 text-layers-ink-soft">{product.stock}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.isAvailable ? 'bg-layers-success/15 text-layers-success' : 'bg-layers-error/15 text-layers-error'
                        }`}
                      >
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`} className="rounded-full p-2 hover:bg-layers-surface-alt">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => handleDelete(product)} aria-label={`Delete ${product.name}`} className="rounded-full p-2 text-layers-error hover:bg-layers-error/10">
                          <Trash2 size={15} />
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

      {modalOpen && <ProductFormModal product={editing} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />}
    </div>
  );
}
