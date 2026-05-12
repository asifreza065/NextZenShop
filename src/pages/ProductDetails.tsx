import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, getDoc, collection, query, where, limit, getDocs, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formatPrice, cn } from '../lib/utils';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, ArrowLeft, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ProductImage } from '../components/ProductImage';
import { MAIN_CATEGORIES } from '../lib/categories';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const addItem = useCartStore(state => state.addItem);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    const fetchProductAndRelated = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const productData: any = { id: snap.id, ...snap.data() };
          setProduct(productData);

          if (productData.categoryId) {
            const q = query(
              collection(db, 'products'),
              where('categoryId', '==', productData.categoryId),
              limit(5)
            );
            const relatedSnap = await getDocs(q);
            const related = relatedSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(p => p.id !== id);
            setRelatedProducts(related);
          }
        } else {
          toast.error('Product not found');
          navigate('/');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();

    // Listen for reviews
    const reviewsRef = collection(db, 'products', id, 'reviews');
    const reviewsQuery = query(reviewsRef, orderBy('createdAt', 'desc'));
    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const revs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setReviews(revs);
    });

    return () => unsubscribeReviews();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    // Add to local state for fast UI
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      quantity,
      stock: product.stock
    });
    
    // Add to Firestore if logged in
    if (user) {
      try {
        const cartRef = doc(db, 'users', user.uid, 'cart', product.id);
        const snap = await getDoc(cartRef);
        if (snap.exists()) {
          // just an example of updating quantity in firestore
        } else {
          await addDoc(collection(db, 'users', user.uid, 'cart'), {
            productId: product.id,
            quantity,
            addedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error('Error saving to Firestore cart', err);
      }
    }
    
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please login to use Wishlist');
      return;
    }
    try {
      await addDoc(collection(db, 'users', user.uid, 'wishlist'), {
        productId: product.id,
        addedAt: serverTimestamp()
      });
      toast.success('Added to Wish List');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add to wish list');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to review');
      return;
    }
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        rating: reviewRating,
        comment: reviewText.trim(),
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'products', product.id, 'reviews'), reviewData);
      setReviewText('');
      setReviewRating(5);
      toast.success('Review submitted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 h-[500px] bg-gray-100 rounded-2xl"></div>
        <div className="md:col-span-4 space-y-4">
          <div className="h-8 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
          <div className="h-10 bg-gray-100 rounded w-1/2"></div>
          <div className="h-32 bg-gray-100 rounded w-full"></div>
        </div>
        <div className="md:col-span-3 h-[400px] bg-gray-100 rounded-xl"></div>
      </div>
    </div>;
  }

  if (!product) return null;

  const categoryName = MAIN_CATEGORIES.find(c => c.id === product.categoryId)?.name || product.categoryId;
  
  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  const calculatedRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating || 0;
  
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate(-1)} className="hover:text-gray-900 transition-colors uppercase font-medium">Back</button>
          <span>/</span>
          <span className="capitalize">{categoryName}</span>
          {product.subCategory && (
            <>
              <span>/</span>
              <span className="capitalize">{product.subCategory}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: Images */}
          <div className="lg:col-span-5 flex flex-col-reverse md:flex-row gap-4 h-auto">
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 flex-shrink-0 hide-scrollbar pb-2 md:pb-0 pr-2">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative aspect-square w-16 md:w-full rounded-lg overflow-hidden border-2 transition-all bg-white flex-shrink-0 p-1",
                      activeImage === idx ? 'border-indigo-600 ring-1 ring-indigo-600/20' : 'border-gray-200 hover:border-gray-300'
                    )}
                    onMouseEnter={() => setActiveImage(idx)}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-4 relative group cursor-zoom-in">
              <ProductImage 
                src={product.images[activeImage]} 
                alt={product.name} 
                containerClassName="w-full h-full max-h-[500px]"
                imageClassName="group-hover:scale-[1.5] transition-transform duration-500 origin-center"
                isZoomable={false}
              />
            </div>
          </div>

          {/* MIDDLE: Product Info */}
          <div className="lg:col-span-4 flex flex-col">
            {product.brand && (
              <p className="text-indigo-600 font-medium text-sm mb-1 uppercase tracking-wider">{product.brand}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
            
            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(Number(calculatedRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer" onClick={() => setActiveTab('reviews')}>{reviews.length > 0 ? reviews.length : product.reviewCount || 0} ratings</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">Search this page</span>
            </div>

            {/* Price Info */}
            <div className="mb-6">
              {discountPercentage > 0 && (
                 <div className="flex items-center gap-3 mb-1">
                   <span className="text-2xl font-light text-red-600">-{discountPercentage}%</span>
                   <span className="text-3xl font-bold text-gray-900">{formatPrice(product.discountPrice)}</span>
                 </div>
              )}
              <div className="flex gap-2 items-baseline text-sm text-gray-500">
                <span>{discountPercentage > 0 ? 'M.R.P.:' : 'Price:'}</span>
                <span className={discountPercentage > 0 ? "line-through" : "text-3xl font-bold text-gray-900"}>
                  {formatPrice(product.price)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
            </div>

            {/* Short Specs / Highlights */}
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
              {product.brand && <div className="flex"><span className="w-24 font-medium text-sm">Brand</span> <span className="text-sm text-gray-700">{product.brand}</span></div>}
              {product.sku && <div className="flex"><span className="w-24 font-medium text-sm">SKU</span> <span className="text-sm text-gray-700">{product.sku}</span></div>}
              <div className="flex"><span className="w-24 font-medium text-sm">Category</span> <span className="text-sm text-gray-700 capitalize">{categoryName}</span></div>
            </div>

            {/* About this item */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">About this item</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
                {product.description?.split('\n').filter((l: string) => l.trim() !== '').slice(0, 5).map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                )) || <li>No description available for this product.</li>}
              </ul>
              <button 
                onClick={() => setActiveTab('description')}
                className="text-indigo-600 text-sm font-medium hover:underline mt-4 cursor-pointer"
              >
                See more product details
              </button>
            </div>
          </div>

          {/* RIGHT: Buy Box */}
          <div className="lg:col-span-3">
            <div className="bg-white border text-gray-900 border-gray-200 rounded-xl p-5 shadow-sm sticky top-24">
              <p className="text-3xl font-bold mb-4">{formatPrice(product.discountPrice || product.price)}</p>
              
              <div className="space-y-4 mb-6">
                {product.deliveryInfo && (
                  <div className="flex gap-3 text-sm text-gray-700">
                    <Truck className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span><span className="font-bold">Delivery:</span> {product.deliveryInfo}</span>
                  </div>
                )}
                <div className="flex gap-3 text-sm text-gray-700">
                   <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                   <span>Delivered to select locations</span>
                </div>
              </div>

              <h3 className={`text-xl font-medium mb-4 ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </h3>

              {product.stock > 0 && (
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium mb-2 text-gray-700">Quantity</label>
                  <select 
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 p-2 border"
                  >
                    {Array.from({ length: Math.min(10, product.stock) }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black font-medium border border-[#FCD200] rounded-full h-11 shadow-none" 
                  onClick={handleAddToCart} 
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-black font-medium border border-[#FF8F00] rounded-full h-11 shadow-none" 
                  onClick={handleBuyNow} 
                  disabled={product.stock === 0}
                >
                  Buy Now
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <LockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-indigo-600 hover:underline cursor-pointer">Secure transaction</span>
              </div>

              <div className="mt-4 text-xs text-gray-500 space-y-2">
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <span>Ships from</span>
                  <span className="font-medium text-gray-900">NextZenShop</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <span>Sold by</span>
                  <span className="font-medium text-gray-900 text-indigo-600">NextZenShop Retail</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={handleAddToWishlist}
                  className="w-full text-left text-sm text-gray-900 border border-gray-300 rounded-md py-2 px-3 shadow-sm hover:bg-gray-50 font-medium"
                >
                  Add to Wish List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="border-t border-gray-200 bg-white pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
             {[
               { id: 'description', label: 'Description' },
               { id: 'specifications', label: 'Specifications' },
               { id: 'reviews', label: 'Customer Reviews' },
               { id: 'shipping', label: 'Shipping & Returns' },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "py-3 px-6 font-semibold text-sm whitespace-nowrap transition-colors",
                   activeTab === tab.id 
                    ? "border-b-2 border-indigo-600 text-indigo-600" 
                    : "text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
                 )}
               >
                 {tab.label}
               </button>
             ))}
          </div>

          <div className="max-w-4xl">
            {activeTab === 'description' && (
              <div className="prose prose-sm sm:prose max-w-none text-gray-700">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
                {product.description?.split('\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                )) || <p>No description provided.</p>}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="bg-white border text-sm border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                       <tbody>
                        {Object.entries(product.specifications).map(([key, value], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-3 px-6 font-medium text-gray-900 border-b border-gray-100 capitalize w-1/3">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                            <td className="py-3 px-6 text-gray-700 border-b border-gray-100">{String(value)}</td>
                          </tr>
                        ))}
                       </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                     <p className="text-sm text-gray-500">No specifications provided for this product.</p>
                  </div>
                )}
                
                {/* Additional Info block */}
                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">General Details</h3>
                <div className="bg-gray-50 p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm border border-gray-100">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-600">Brand</span>
                    <span className="text-gray-900">{product.brand || 'Generic'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-600">Category</span>
                    <span className="text-gray-900 capitalize">{categoryName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-600">SKU</span>
                    <span className="text-gray-900">{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-600">Stock Status</span>
                    <span className="text-gray-900">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  {product.barcode && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-medium text-gray-600">Barcode</span>
                      <span className="text-gray-900">{product.barcode}</span>
                    </div>
                  )}
                  {product.shippingWeight && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-medium text-gray-600">Shipping Weight</span>
                      <span className="text-gray-900">{product.shippingWeight}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                
                <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                  <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-6 h-6 ${i < Math.floor(Number(calculatedRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xl font-bold">{calculatedRating} out of 5</span>
                    </div>
                    <p className="text-sm text-gray-500">{reviews.length > 0 ? reviews.length : product.reviewCount || 0} global ratings</p>
                    
                    <div className="mt-4 space-y-2">
                      {ratingCounts.map(({ stars, percentage }) => (
                        <div key={stars} className="flex items-center gap-3 text-sm">
                          <span className="w-12 text-blue-600 hover:underline cursor-pointer">{stars} star</span>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                            <div 
                              className="h-full bg-yellow-400 transition-all" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="w-8 text-right text-gray-500">{Math.round(percentage)}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-6 bg-gray-50 p-6 rounded-xl border">
                      <h3 className="font-bold text-gray-900 mb-2">Review this product</h3>
                      <p className="text-sm text-gray-600 mb-4">Share your thoughts with other customers</p>
                      
                      {!user ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/login')}
                        >
                          Sign in to Review
                        </Button>
                      ) : (
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          <div>
                            <select 
                              value={reviewRating}
                              onChange={(e) => setReviewRating(Number(e.target.value))}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border bg-white"
                            >
                              <option value={5}>5 Stars - Excellent</option>
                              <option value={4}>4 Stars - Good</option>
                              <option value={3}>3 Stars - Average</option>
                              <option value={2}>2 Stars - Poor</option>
                              <option value={1}>1 Star - Terrible</option>
                            </select>
                          </div>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm min-h-[100px]"
                            placeholder="Write your review here..."
                            required
                          />
                          <Button type="submit" disabled={submittingReview} className="w-full">
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-2/3">
                    {reviews.length === 0 ? (
                      <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold uppercase">
                                {review.userName?.substring(0, 2) || 'AN'}
                              </div>
                              <span className="font-medium text-sm text-gray-900">{review.userName || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                            {review.createdAt && (
                              <p className="text-xs text-gray-500 mb-3">
                                Reviewed on {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                              </p>
                            )}
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Truck className="w-5 h-5 text-indigo-600" /> Shipping Information</h3>
                  <p className="text-sm text-gray-700">
                    We offer free standard shipping on all orders over $50. Standard shipping typically takes 3-5 business days.
                    Expedited shipping options are available at checkout for an additional fee.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><RotateCcw className="w-5 h-5 text-indigo-600" /> Return Policy</h3>
                  <p className="text-sm text-gray-700">
                    You may return most new, unopened items within 30 days of delivery for a full refund. 
                    We'll also pay the return shipping costs if the return is a result of our error (you received an incorrect or defective item, etc.).
                  </p>
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-600" /> Warranty</h3>
                   <p className="text-sm text-gray-700">
                     This product is backed by a 1-year limited manufacturer warranty. 
                     Please keep your receipt as proof of purchase.
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently bought together</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
            {relatedProducts.map(p => (
              <div key={p.id} className="w-48 flex-shrink-0 cursor-pointer group" onClick={() => navigate(`/product/${p.id}`)}>
                <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <ProductImage 
                    src={p.images[0]} 
                    alt={p.name} 
                    containerClassName="w-full h-full p-2"
                    imageClassName="group-hover:scale-110"
                  />
                </div>
                <h3 className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline line-clamp-2 mb-1">{p.name}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-600">{p.rating}</span>
                </div>
                <p className="text-sm font-bold text-red-600">{formatPrice(p.discountPrice || p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

