import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  Star,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Share2,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { Product, ProductReview } from '../types/index';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setQuantity(1);
    setSelectedImageIndex(0);

    api.products
      .getById(productId)
      .then((res) => {
        if (isMounted) {
          setProduct(res.product);
          setRelatedProducts(res.relatedProducts);
          setReviews(res.reviews);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-sm text-slate-500">Loading product information...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">The requested item might have been unlisted or removed.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    const res = addToCart(product, quantity);
    setFeedbackMessage(res.message);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onNavigate('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      const res = await api.products.addReview(product.id, {
        rating: newRating,
        comment: newComment,
      });
      setReviews((prev) => [res.review, ...prev]);
      setReviewSuccess('Your review has been posted successfully!');
      setNewComment('');
      setTimeout(() => setReviewSuccess(null), 4000);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => onNavigate('shop')}
          className="hover:text-amber-600 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate('shop', product.categoryId)}
          className="hover:text-amber-600"
        >
          {product.categoryName}
        </button>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery Column */}
        <div className="space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-square w-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-black bg-rose-600 text-white shadow-md">
                SAVE {discountPercent}%
              </span>
            )}
            {product.isDemo && (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white shadow-md">
                DEMO CATALOG ITEM
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-amber-500 ring-2 ring-amber-500/20 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Purchase Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="uppercase font-bold tracking-wider text-amber-600">
                {product.categoryName}
              </span>
              <span className="font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
              {product.name}
            </h1>

            {/* Rating Bar */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-slate-600 hover:text-amber-600 underline font-medium"
              >
                {reviews.length} Customer Reviews
              </button>
            </div>
          </div>

          {/* Price & Savings */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 font-heading">
                PKR {displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-400 line-through">
                  PKR {product.price.toLocaleString()}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-xs font-bold text-rose-600">
                You save PKR {(product.price - product.discountPrice!).toLocaleString()} ({discountPercent}% off retail price)
              </p>
            )}
            <p className="text-[11px] text-slate-500">
              Tax included. Free nationwide shipping on orders over PKR 5,000.
            </p>
          </div>

          {/* Stock Availability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Stock Availability:</span>
              {isOutOfStock ? (
                <span className="font-bold text-rose-600">Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Hurry, only {product.stock} units remaining!
                </span>
              ) : (
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  In Stock ({product.stock} units ready to ship)
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  (Max: {product.stock})
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {feedbackMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Buy Now (Express)</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 border rounded-2xl transition-colors shrink-0 flex items-center justify-center ${
                  isFavorited
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <Truck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">2-4 Days Shipping</p>
              <p className="text-[10px] text-slate-400">All Pakistan cities</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <ShieldCheck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">100% Original</p>
              <p className="text-[10px] text-slate-400">Verified warranty</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <RotateCcw className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">7 Days Return</p>
              <p className="text-[10px] text-slate-400">Guaranteed refund</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex border-b border-slate-200 gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 transition-colors ${
              activeTab === 'details'
                ? 'border-b-2 border-amber-600 text-amber-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 transition-colors ${
              activeTab === 'specs'
                ? 'border-b-2 border-amber-600 text-amber-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors ${
              activeTab === 'reviews'
                ? 'border-b-2 border-amber-600 text-amber-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-6">
          {activeTab === 'details' && (
            <div className="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
              <p>{product.description}</p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 mt-4">
                <h4 className="font-bold text-slate-900">Delivery & Packaging Notice</h4>
                <p className="text-xs text-slate-600">
                  Every product shipped from Ahti Store is securely inspected and packaged with tamper-proof security seals. Cash on Delivery is available across Karachi, Lahore, Rawalpindi, Islamabad, Faisalabad, Multan, Peshawar, Quetta, and all regional districts.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-3 p-3.5 text-xs">
                      <span className="font-bold text-slate-600">{key}</span>
                      <span className="col-span-2 text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Standard manufacturer specifications apply for this item.
                </p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Write Review Form */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-2xl">
                <h4 className="font-bold text-slate-900 text-sm mb-3">
                  Write a Customer Review
                </h4>
                {reviewSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold mb-4">
                    {reviewSuccess}
                  </div>
                )}
                {reviewError && (
                  <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-bold mb-4">
                    {reviewError}
                  </div>
                )}

                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Review Comments
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell others about product quality, performance, and delivery experience..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span>Please log in to your account to submit a verified product review.</span>
                    <button
                      onClick={() => onNavigate('login')}
                      className="px-4 py-1.5 bg-amber-600 text-white rounded-lg font-bold"
                    >
                      Log In
                    </button>
                  </div>
                )}
              </div>

              {/* Existing Reviews List */}
              <div className="space-y-4 max-w-3xl">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    No reviews yet. Be the first customer to review this item!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{rev.userName}</span>
                        <span className="text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-amber-400">
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-6">
            Related Products in {product.categoryName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
