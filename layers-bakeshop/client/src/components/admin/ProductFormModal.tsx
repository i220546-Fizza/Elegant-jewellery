import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Product, ProductCategory } from '../../types';

const categories: ProductCategory[] = ['Cakes', 'Cupcakes', 'Brownies', 'Cookies', 'Donuts', 'Desserts', 'Sundaes', 'Beverages'];

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function ProductFormModal({ product, onClose, onSubmit }: ProductFormModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Cakes' as ProductCategory,
    price: '',
    stock: '',
    isAvailable: true,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: false,
    ingredients: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        category: product.category,
        price: String(product.price),
        stock: String(product.stock),
        isAvailable: product.isAvailable,
        isFeatured: !!product.isFeatured,
        isBestseller: !!product.isBestseller,
        isNewArrival: !!product.isNewArrival,
        ingredients: product.ingredients?.join(', ') ?? '',
      });
      setPreview(product.images[0] ?? null);
    }
  }, [product]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('price', form.price);
      data.append('stock', form.stock);
      data.append('isAvailable', String(form.isAvailable));
      data.append('isFeatured', String(form.isFeatured));
      data.append('isBestseller', String(form.isBestseller));
      data.append('isNewArrival', String(form.isNewArrival));
      data.append('ingredients', form.ingredients);
      if (imageFile) data.append('image', imageFile);
      await onSubmit(data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not save product.');
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-layers-overlay p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-layers-surface p-7"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-layers-ink">{product ? 'Edit Product' : 'Add Product'}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-layers-surface-alt">
              <X size={20} />
            </button>
          </div>

          {error && <p className="mt-4 rounded-lg bg-layers-error/10 px-3 py-2 text-sm text-layers-error">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-layers-ink-soft">Product Image</label>
              <div className="mt-1.5 flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-layers-surface-alt">
                  {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
                </div>
                <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="text-sm text-layers-ink-soft">Name</label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-2.5 text-sm focus:border-layers-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm text-layers-ink-soft">Description</label>
              <textarea
                id="description"
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-2.5 text-sm focus:border-layers-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="ingredients" className="text-sm text-layers-ink-soft">Ingredients (comma separated)</label>
              <input
                id="ingredients"
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-2.5 text-sm focus:border-layers-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="text-sm text-layers-ink-soft">Category</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                  className="mt-1.5 w-full rounded-xl border border-layers-border px-3 py-2.5 text-sm focus:border-layers-primary focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="price" className="text-sm text-layers-ink-soft">Price (PKR)</label>
                <input
                  id="price"
                  type="number"
                  min={0}
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-layers-border px-3 py-2.5 text-sm focus:border-layers-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="stock" className="text-sm text-layers-ink-soft">Stock</label>
                <input
                  id="stock"
                  type="number"
                  min={0}
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-layers-border px-3 py-2.5 text-sm focus:border-layers-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              {([
                ['isAvailable', 'Available'],
                ['isFeatured', 'Featured'],
                ['isBestseller', 'Bestseller'],
                ['isNewArrival', 'New Arrival'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-layers-ink-soft">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="accent-layers-primary"
                  />
                  {label}
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-layers-primary py-3 text-sm font-semibold text-white hover:bg-layers-primary-hover disabled:opacity-60"
            >
              {saving ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
