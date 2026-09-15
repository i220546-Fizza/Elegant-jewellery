import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../types';
import { fetchProductByIdOrSlug, fetchRelatedProducts, submitProductReview } from '../services/productService';
import { getErrorMessage } from '../services/api';
import { formatCurrency, categoryLabel } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import QuantitySelector from '../components/QuantitySelector';
import StarRating from '../components/StarRating';
import ProductGrid from '../components/ProductGrid';
import { HeartIcon } from '../components/Icons';

type Tab = 'details' | 'reviews';

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [tab, setTab] = useState<Tab>('details');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductByIdOrSlug(slug)
      .then(async (p) => {
        setProduct(p);
        setActiveImage(0);
        setQuantity(1);
        setSize(p.sizes[0] || '');
        document.title = `${p.name} | Elegant Jewellery`;
        try {
          const relatedProducts = await fetchRelatedProducts(p._id);
          setRelated(relatedProducts);
        } catch {
          /* related products are non-critical */
        }
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner fullScreen label="Loading product" />;

  if (!product) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="font-display text-2xl text-brown-dark">Product not found</h1>
        <Link to="/shop" className="btn-secondary mt-6 inline-flex">
          Back to Shop
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product._id);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !size) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, quantity, size);
  };

  const handleBuyNow = () => {
    if (product.sizes.length > 0 && !size) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, quantity, size);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please share a few words about the product');
      return;
    }
    setSubmittingReview(true);
    try {
      await submitProductReview(product._id, { rating: reviewRating, comment: reviewComment });
      toast.success('Thank you for your review!');
      const refreshed = await fetchProductByIdOrSlug(product.slug);
      setProduct(refreshed);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container-luxe py-12">
      <nav className="mb-8 text-xs text-brown-light">
        <Link to="/" className="hover:text-champagne-dark">Home</Link> /{' '}
        <Link to="/shop" className="hover:text-champagne-dark">Shop</Link> /{' '}
        <Link to={`/shop?category=${product.category}`} className="hover:text-champagne-dark">
          {categoryLabel(product.category)}
        </Link>{' '}
        / <span className="text-brown-dark">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="group aspect-square overflow-hidden rounded-2xl bg-beige shadow-card">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                    activeImage === i ? 'border-champagne-dark' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-widest text-champagne-dark">{categoryLabel(product.category)}</span>
          <h1 className="font-display text-3xl text-brown-dark sm:text-4xl">{product.name}</h1>
          <StarRating rating={product.rating} count={product.numReviews} size={16} />

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-medium text-brown-dark">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-base text-brown-light line-through">{formatCurrency(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="leading-relaxed text-brown-light">{product.description}</p>

          <div className="text-sm text-brown-dark">
            <span className="font-medium">Material:</span> {product.material}
          </div>
          <div className="text-sm">
            {outOfStock ? (
              <span className="font-medium text-red-500">Out of stock</span>
            ) : (
              <span className="font-medium text-green-700">In stock ({product.stock} available)</span>
            )}
          </div>

          {product.sizes.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-brown-dark">Size / Option</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                      size === s ? 'border-brown-dark bg-brown-dark text-ivory' : 'border-brown-dark/25 text-brown-dark hover:border-brown-dark'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <QuantitySelector quantity={quantity} onChange={setQuantity} max={Math.max(product.stock, 1)} />
            <button onClick={handleAddToCart} disabled={outOfStock} className="btn-primary flex-1 sm:flex-none">
              Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={outOfStock} className="btn-gold flex-1 sm:flex-none">
              Buy Now
            </button>
            <button
              onClick={() => toggle(product)}
              aria-label="Toggle wishlist"
              className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                wishlisted ? 'border-champagne-dark bg-champagne/20 text-champagne-dark' : 'border-brown-dark/20 text-brown-dark'
              }`}
            >
              <HeartIcon filled={wishlisted} />
            </button>
          </div>

          <div className="mt-6 border-t border-brown-dark/10 pt-6">
            <div className="flex gap-6 border-b border-brown-dark/10">
              <button
                onClick={() => setTab('details')}
                className={`pb-3 text-sm uppercase tracking-widest ${
                  tab === 'details' ? 'border-b-2 border-champagne-dark text-brown-dark' : 'text-brown-light'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setTab('reviews')}
                className={`pb-3 text-sm uppercase tracking-widest ${
                  tab === 'reviews' ? 'border-b-2 border-champagne-dark text-brown-dark' : 'text-brown-light'
                }`}
              >
                Reviews ({product.numReviews})
              </button>
            </div>

            {tab === 'details' ? (
              <div className="pt-6 text-sm leading-relaxed text-brown-light">
                <p>{product.description}</p>
                <ul className="mt-4 space-y-2">
                  <li><span className="font-medium text-brown-dark">Category:</span> {categoryLabel(product.category)}</li>
                  <li><span className="font-medium text-brown-dark">Material:</span> {product.material}</li>
                  <li><span className="font-medium text-brown-dark">Care:</span> Store separately in a soft pouch, avoid contact with perfume and water.</li>
                </ul>
              </div>
            ) : (
              <div className="pt-6">
                <div className="space-y-6">
                  {product.reviews.length === 0 && (
                    <p className="text-sm text-brown-light">No reviews yet. Be the first to share your thoughts.</p>
                  )}
                  {product.reviews.map((r, i) => (
                    <div key={i} className="border-b border-brown-dark/5 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-brown-dark">{r.name}</span>
                        <StarRating rating={r.rating} />
                      </div>
                      <p className="mt-2 text-sm text-brown-light">{r.comment}</p>
                    </div>
                  ))}
                </div>

                {user ? (
                  <form onSubmit={handleReviewSubmit} className="mt-6 space-y-3">
                    <p className="text-xs uppercase tracking-widest text-brown-dark">Write a Review</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button type="button" key={n} onClick={() => setReviewRating(n)}>
                          <StarRating rating={n <= reviewRating ? 5 : 0} size={20} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this piece..."
                      className="input-luxe min-h-[100px]"
                    />
                    <button type="submit" disabled={submittingReview} className="btn-secondary">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <p className="mt-6 text-sm text-brown-light">
                    <Link to="/login" className="text-champagne-dark hover:underline">Sign in</Link> to write a review.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="section-heading mb-8 text-center">You May Also Like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
