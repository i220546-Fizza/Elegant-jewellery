import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi, categoryApi, productApi } from '../../services';
import type { BottleSpec, Category, Notes, Product } from '../../types';
import { AdminHeader, Panel, Toggle } from '../components/ui';
import Bottle3D from '../../components/product/Bottle3D';
import ProductImage from '../../components/product/ProductImage';
import { Spinner } from '../../components/ui/Feedback';
import { CloseIcon } from '../../components/ui/Icons';
import { discounted, formatPrice } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

interface VariantRow {
  _id?: string;
  size: string;
  price: string;
  stock: string;
  sku: string;
}

interface FormState {
  name: string;
  tagline: string;
  description: string;
  story: string;
  gender: Product['gender'];
  categories: string[];
  fragranceFamily: string;
  concentration: string;
  notes: Notes;
  ingredients: string;
  longevity: string;
  sillage: string;
  variants: VariantRow[];
  discountPercent: string;
  images: string[];
  model3d: string;
  bottle: BottleSpec;
  featured: boolean;
  signatureOrder: string;
  bestseller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  lowStockThreshold: string;
}

const EMPTY: FormState = {
  name: '',
  tagline: '',
  description: '',
  story: '',
  gender: 'unisex',
  categories: [],
  fragranceFamily: '',
  concentration: 'Eau de Parfum',
  notes: { top: [], heart: [], base: [] },
  ingredients: '',
  longevity: '',
  sillage: '',
  variants: [
    { size: '50 ml', price: '', stock: '', sku: '' },
    { size: '100 ml', price: '', stock: '', sku: '' },
  ],
  discountPercent: '0',
  images: [],
  model3d: '',
  bottle: { shape: 'classic', liquid: '#E9D9AE', cap: 'gold', glass: 'clear' },
  featured: false,
  signatureOrder: '0',
  bestseller: false,
  isNewArrival: true,
  isActive: true,
  lowStockThreshold: '5',
};

const fromProduct = (p: Product): FormState => ({
  name: p.name,
  tagline: p.tagline,
  description: p.description,
  story: p.story || '',
  gender: p.gender,
  categories: p.categories.map((c) => c._id),
  fragranceFamily: p.fragranceFamily,
  concentration: p.concentration,
  notes: p.notes,
  ingredients: p.ingredients,
  longevity: p.longevity,
  sillage: p.sillage,
  variants: p.variants.map((v) => ({ _id: v._id, size: v.size, price: String(v.price), stock: String(v.stock), sku: v.sku || '' })),
  discountPercent: String(p.discountPercent || 0),
  images: p.images,
  model3d: p.model3d || '',
  bottle: p.bottle,
  featured: p.featured,
  signatureOrder: String(p.signatureOrder || 0),
  bestseller: p.bestseller,
  isNewArrival: p.isNewArrival,
  isActive: p.isActive,
  lowStockThreshold: String(p.lowStockThreshold ?? 5),
});

/** Tag-style input for a list of fragrance notes. */
const NotesInput = ({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft('');
  };
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex min-h-[46px] flex-wrap items-center gap-2 border border-taupe bg-white/60 px-2 py-2">
        {value.map((n) => (
          <span key={n} className="inline-flex items-center gap-1.5 bg-taupe/50 px-2 py-1 text-xs">
            {n}
            <button type="button" aria-label={`Remove ${n}`} onClick={() => onChange(value.filter((x) => x !== n))}>
              <CloseIcon size={10} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          placeholder={value.length ? '' : 'Type a note, press Enter'}
          className="min-w-[120px] flex-1 border-0 bg-transparent p-1 text-sm focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
};

const ProductForm = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState | null>(isNew ? EMPTY : null);
  const [cats, setCats] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'images' | 'model' | null>(null);
  const [slug, setSlug] = useState('');
  const imgInput = useRef<HTMLInputElement>(null);
  const modelInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    categoryApi.list(true).then(setCats).catch(() => {});
    if (id) {
      productApi
        .get(id)
        .then((p) => {
          setForm(fromProduct(p));
          setSlug(p.slug);
        })
        .catch((e) => {
          toast.error(getErrorMessage(e));
          navigate('/admin/products');
        });
    }
  }, [id, navigate]);

  if (!form) return <Spinner />;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const setVariant = (i: number, k: keyof VariantRow, v: string) => set('variants', form.variants.map((row, j) => (j === i ? { ...row, [k]: v } : row)));

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading('images');
    try {
      const urls = await adminApi.uploadImages(Array.from(files));
      set('images', [...form.images, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(null);
      if (imgInput.current) imgInput.current.value = '';
    }
  };

  const uploadModel = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setUploading('model');
    try {
      set('model3d', await adminApi.uploadModel(files[0]));
      toast.success('3D model uploaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(null);
      if (modelInput.current) modelInput.current.value = '';
    }
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...form.images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set('images', next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const variants = form.variants.filter((v) => v.size.trim());
    if (!variants.length || variants.some((v) => v.price === '' || Number(v.price) < 0)) {
      toast.error('Each size needs a price');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      variants: variants.map((v) => ({ ...(v._id ? { _id: v._id } : {}), size: v.size, price: Number(v.price), stock: Number(v.stock || 0), sku: v.sku })),
      discountPercent: Number(form.discountPercent || 0),
      signatureOrder: Number(form.signatureOrder || 0),
      lowStockThreshold: Number(form.lowStockThreshold || 0),
    };
    try {
      const saved = isNew ? await productApi.create(payload) : await productApi.update(id!, payload);
      toast.success(isNew ? `${saved.name} created` : 'Changes saved');
      if (isNew) navigate(`/admin/products/${saved._id}`, { replace: true });
      else {
        setForm(fromProduct(saved));
        setSlug(saved.slug);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const discount = Number(form.discountPercent || 0);

  return (
    <form onSubmit={submit}>
      <AdminHeader
        eyebrow={isNew ? 'New fragrance' : 'Edit fragrance'}
        title={form.name || 'Untitled fragrance'}
        actions={
          <>
            {slug && (
              <Link to={`/fragrance/${slug}`} target="_blank" className="btn-outline !py-3">
                View in store
              </Link>
            )}
            <button type="submit" disabled={saving} className="btn-dark !py-3">
              {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Details">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="label">Name *</span>
                <input className="field-box" required value={form.name} onChange={(e) => set('name', e.target.value)} />
              </label>
              <label className="block">
                <span className="label">Tagline</span>
                <input className="field-box" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Bergamot · Jasmine · White Musk" />
              </label>
              <label className="block">
                <span className="label">Fragrance family *</span>
                <input className="field-box" required value={form.fragranceFamily} onChange={(e) => set('fragranceFamily', e.target.value)} placeholder="Floral Musk" />
              </label>
              <label className="block">
                <span className="label">Concentration</span>
                <select className="field-box" value={form.concentration} onChange={(e) => set('concentration', e.target.value)}>
                  {['Eau de Parfum', 'Extrait de Parfum', 'Eau de Toilette', 'Parfum'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Wearer</span>
                <select className="field-box" value={form.gender} onChange={(e) => set('gender', e.target.value as FormState['gender'])}>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="unisex">Unisex</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">Longevity</span>
                  <input className="field-box" value={form.longevity} onChange={(e) => set('longevity', e.target.value)} placeholder="8 – 10 hours" />
                </label>
                <label className="block">
                  <span className="label">Sillage</span>
                  <input className="field-box" value={form.sillage} onChange={(e) => set('sillage', e.target.value)} placeholder="Moderate" />
                </label>
              </div>
              <label className="block sm:col-span-2">
                <span className="label">Description *</span>
                <textarea className="field-box min-h-[110px]" required value={form.description} onChange={(e) => set('description', e.target.value)} />
              </label>
              <label className="block sm:col-span-2">
                <span className="label">Story (shown on the product page)</span>
                <textarea className="field-box min-h-[80px]" value={form.story} onChange={(e) => set('story', e.target.value)} />
              </label>
              <label className="block sm:col-span-2">
                <span className="label">Ingredients</span>
                <textarea className="field-box min-h-[70px]" value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)} />
              </label>
            </div>
          </Panel>

          <Panel title="Fragrance notes">
            <div className="grid gap-5 md:grid-cols-3">
              <NotesInput label="Top notes" value={form.notes.top} onChange={(v) => set('notes', { ...form.notes, top: v })} />
              <NotesInput label="Heart notes" value={form.notes.heart} onChange={(v) => set('notes', { ...form.notes, heart: v })} />
              <NotesInput label="Base notes" value={form.notes.base} onChange={(v) => set('notes', { ...form.notes, base: v })} />
            </div>
          </Panel>

          <Panel title="Sizes, prices & stock" action={<button type="button" onClick={() => set('variants', [...form.variants, { size: '', price: '', stock: '', sku: '' }])} className="font-sans text-[10px] uppercase tracking-wide2 hover:text-gold">+ Add size</button>}>
            <div className="space-y-3">
              <div className="hidden grid-cols-[1fr_1fr_1fr_1fr_110px_32px] gap-3 sm:grid">
                {['Size', 'Price (PKR)', 'Stock', 'SKU', 'Sale price', ''].map((h) => (
                  <span key={h} className="label !mb-0">
                    {h}
                  </span>
                ))}
              </div>
              {form.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 border-b border-taupe/50 pb-3 sm:grid-cols-[1fr_1fr_1fr_1fr_110px_32px] sm:border-0 sm:pb-0">
                  <input className="field-box" value={v.size} onChange={(e) => setVariant(i, 'size', e.target.value)} placeholder="50 ml" aria-label="Size" />
                  <input className="field-box" type="number" min={0} value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} aria-label="Price" />
                  <input className="field-box" type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, 'stock', e.target.value)} aria-label="Stock" />
                  <input className="field-box" value={v.sku} onChange={(e) => setVariant(i, 'sku', e.target.value)} aria-label="SKU" />
                  <span className="self-center text-sm text-stone">{v.price ? formatPrice(discounted(Number(v.price), discount)) : '—'}</span>
                  <button type="button" aria-label="Remove size" onClick={() => set('variants', form.variants.filter((_, j) => j !== i))} className="self-center text-stone hover:text-ink">
                    <CloseIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="label">Discount (%)</span>
                <input className="field-box" type="number" min={0} max={90} value={form.discountPercent} onChange={(e) => set('discountPercent', e.target.value)} />
              </label>
              <label className="block">
                <span className="label">Low-stock alert at</span>
                <input className="field-box" type="number" min={0} value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)} />
              </label>
            </div>
          </Panel>

          <Panel title="Images" action={<button type="button" onClick={() => imgInput.current?.click()} disabled={uploading !== null} className="font-sans text-[10px] uppercase tracking-wide2 hover:text-gold">{uploading === 'images' ? 'Uploading…' : '+ Upload images'}</button>}>
            <input ref={imgInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => uploadImages(e.target.files)} />
            {form.images.length === 0 ? (
              <button type="button" onClick={() => imgInput.current?.click()} className="flex h-32 w-full items-center justify-center border border-dashed border-taupe text-sm text-stone hover:border-gold">
                Upload product images (JPG, PNG, WebP · max 5 MB each). Without images the store shows the 3D bottle.
              </button>
            ) : (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {form.images.map((img, i) => (
                  <li key={img} className="group relative aspect-[4/5] bg-taupe/40">
                    <ProductImage src={img} alt="" className="h-full w-full object-contain p-1" />
                    {i === 0 && <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[9px] uppercase tracking-wide2 text-ivory">Cover</span>}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ivory/90 px-1 py-1 text-xs opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                      <button type="button" onClick={() => moveImage(i, -1)} aria-label="Move left">
                        ←
                      </button>
                      <button type="button" onClick={() => set('images', form.images.filter((x) => x !== img))} aria-label="Remove image">
                        Remove
                      </button>
                      <button type="button" onClick={() => moveImage(i, 1)} aria-label="Move right">
                        →
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="3D presentation">
            <div className="relative aspect-square bg-taupe/40">
              <Bottle3D spec={form.bottle} name={form.name || 'NB'} modelUrl={form.model3d || undefined} mode="viewer" className="absolute inset-0" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label">Bottle shape</span>
                <select className="field-box" value={form.bottle.shape} onChange={(e) => set('bottle', { ...form.bottle, shape: e.target.value as BottleSpec['shape'] })}>
                  {['classic', 'tall', 'round', 'facet', 'flacon'].map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Cap</span>
                <select className="field-box" value={form.bottle.cap} onChange={(e) => set('bottle', { ...form.bottle, cap: e.target.value as BottleSpec['cap'] })}>
                  <option value="gold">Champagne gold</option>
                  <option value="black">Black lacquer</option>
                  <option value="ivory">Ivory</option>
                </select>
              </label>
              <label className="block">
                <span className="label">Glass</span>
                <select className="field-box" value={form.bottle.glass} onChange={(e) => set('bottle', { ...form.bottle, glass: e.target.value as BottleSpec['glass'] })}>
                  <option value="clear">Clear</option>
                  <option value="smoke">Smoked</option>
                  <option value="black">Black</option>
                </select>
              </label>
              <label className="block">
                <span className="label">Liquid colour</span>
                <input type="color" className="h-[46px] w-full cursor-pointer border border-taupe bg-white/60 p-1" value={form.bottle.liquid} onChange={(e) => set('bottle', { ...form.bottle, liquid: e.target.value })} />
              </label>
            </div>
            <div className="mt-5 border-t border-taupe pt-5">
              <span className="label">Custom 3D model (.glb / .gltf, max 25 MB)</span>
              <input ref={modelInput} type="file" accept=".glb,.gltf" hidden onChange={(e) => uploadModel(e.target.files)} />
              {form.model3d ? (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-stone">{form.model3d.split('/').pop()}</span>
                  <button type="button" onClick={() => set('model3d', '')} className="font-sans text-[10px] uppercase tracking-wide2 hover:text-gold">
                    Remove
                  </button>
                </div>
              ) : (
                <button type="button" disabled={uploading !== null} onClick={() => modelInput.current?.click()} className="btn-outline mt-1 w-full !py-3">
                  {uploading === 'model' ? 'Uploading…' : 'Upload 3D model'}
                </button>
              )}
              <p className="mt-2 text-xs text-stone">When a model is uploaded it replaces the procedural bottle in every 3D view.</p>
            </div>
          </Panel>

          <Panel title="Categories">
            <div className="space-y-2">
              {cats.map((c) => (
                <label key={c._id} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-ink"
                    checked={form.categories.includes(c._id)}
                    onChange={(e) => set('categories', e.target.checked ? [...form.categories, c._id] : form.categories.filter((x) => x !== c._id))}
                  />
                  {c.name} <span className="text-xs text-stone">({c.kind === 'audience' ? 'wearer' : 'collection'})</span>
                </label>
              ))}
              <Link to="/admin/categories" className="mt-2 block font-sans text-[10px] uppercase tracking-wide2 text-stone hover:text-ink">
                Manage categories
              </Link>
            </div>
          </Panel>

          <Panel title="Visibility & merchandising">
            <div className="space-y-4">
              <Toggle checked={form.isActive} onChange={(v) => set('isActive', v)} label="Visible in store" />
              <Toggle checked={form.featured} onChange={(v) => set('featured', v)} label="Signature (homepage)" />
              {form.featured && (
                <label className="block pl-12">
                  <span className="label">Signature position</span>
                  <input className="field-box w-24" type="number" min={0} value={form.signatureOrder} onChange={(e) => set('signatureOrder', e.target.value)} />
                </label>
              )}
              <Toggle checked={form.bestseller} onChange={(v) => set('bestseller', v)} label="Bestseller" />
              <Toggle checked={form.isNewArrival} onChange={(v) => set('isNewArrival', v)} label="New arrival" />
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
