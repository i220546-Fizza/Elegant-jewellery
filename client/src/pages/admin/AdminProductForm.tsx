import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  createProduct,
  fetchProductByIdOrSlug,
  updateProduct,
  uploadProductImages,
} from '../../services/productService';
import { getErrorMessage } from '../../services/api';
import type { Category } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CloseIcon } from '../../components/Icons';

const CATEGORIES: Category[] = ['rings', 'necklaces', 'earrings', 'bracelets'];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: 'rings' as Category,
  material: '',
  sizes: '',
  stock: '0',
  featured: false,
  bestseller: false,
  isNewArrival: false,
};

const AdminProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'Add'} Product | Elegant Jewellery Admin`;
    if (!id) return;
    fetchProductByIdOrSlug(id)
      .then((p) => {
        setForm({
          name: p.name,
          description: p.description,
          price: String(p.price),
          compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
          category: p.category,
          material: p.material,
          sizes: p.sizes.join(', '),
          stock: String(p.stock),
          featured: p.featured,
          bestseller: p.bestseller,
          isNewArrival: p.isNewArrival,
        });
        setImages(p.images);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadProductImages(files);
      setImages((prev) => [...prev, ...uploaded]);
      toast.success('Image(s) uploaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.price || !form.material) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (images.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      category: form.category,
      material: form.material,
      images,
      sizes: form.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      stock: Number(form.stock),
      featured: form.featured,
      bestseller: form.bestseller,
      isNewArrival: form.isNewArrival,
    };

    try {
      if (isEdit && id) {
        await updateProduct(id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading product" />;

  return (
    <div>
      <h1 className="font-display text-3xl text-brown-dark">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit} className="card-luxe mt-8 max-w-3xl space-y-5 p-6 sm:p-8">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-brown-dark">Product Images *</label>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={img + i} className="relative h-24 w-24">
                <img src={img} alt="" className="h-full w-full rounded-lg bg-beige object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brown-dark text-ivory"
                >
                  <CloseIcon width={12} height={12} />
                </button>
              </div>
            ))}
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-brown-dark/25 text-xs text-brown-light hover:border-champagne-dark">
              {uploading ? 'Uploading...' : '+ Upload'}
              <input type="file" accept="image/*" multiple hidden onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            required
            placeholder="Product Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-luxe sm:col-span-2"
          />
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
            className="input-luxe"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Material (e.g. 18k Gold Vermeil) *"
            value={form.material}
            onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
            className="input-luxe"
          />
          <input
            required
            type="number"
            min={0}
            placeholder="Price (Rs.) *"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="input-luxe"
          />
          <input
            type="number"
            min={0}
            placeholder="Compare-at Price (optional)"
            value={form.compareAtPrice}
            onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
            className="input-luxe"
          />
          <input
            required
            type="number"
            min={0}
            placeholder="Stock Quantity *"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            className="input-luxe"
          />
          <input
            placeholder="Sizes, comma separated (e.g. 5, 6, 7)"
            value={form.sizes}
            onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
            className="input-luxe"
          />
        </div>

        <textarea
          required
          placeholder="Product Description *"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="input-luxe min-h-[120px]"
        />

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-brown-dark">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-brown-dark">
            <input
              type="checkbox"
              checked={form.bestseller}
              onChange={(e) => setForm((f) => ({ ...f, bestseller: e.target.checked }))}
            />
            Bestseller
          </label>
          <label className="flex items-center gap-2 text-sm text-brown-dark">
            <input
              type="checkbox"
              checked={form.isNewArrival}
              onChange={(e) => setForm((f) => ({ ...f, isNewArrival: e.target.checked }))}
            />
            New Arrival
          </label>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
