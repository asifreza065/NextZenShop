import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductCard, type Product } from '../components/ProductCard';
import { Link } from 'react-router';
import { ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MAIN_CATEGORIES } from '../lib/categories';
import { seedDemoProducts } from '../lib/seed';
import { toast } from 'sonner';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const setupListener = () => {
      setLoading(true);
      setError(null);
      
      try {
        const prodQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
        
        unsubscribe = onSnapshot(prodQuery, async (snap) => {
          if (snap.empty) {
            console.log('Database empty, seeding sample products...');
            const seeded = await seedDemoProducts();
            // Note: After seeding, onSnapshot will trigger again automatically.
            if (!seeded) {
              setLoading(false);
            }
          } else {
             setFeaturedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
             setLoading(false);
          }
        }, (err: any) => {
          console.error('Error fetching home data:', err);
          setError(err.message || 'Failed to load products');
          setLoading(false);
        });
      } catch (err: any) {
        console.error('Listener setup error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    setupListener();

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative px-4 py-12 md:py-24">
        <div className="absolute inset-x-4 inset-y-0 bg-blue-50 rounded-3xl -z-10"></div>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Next Generation <span className="text-indigo-600">Shopping</span> Experience
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover premium tech, fashion, and lifestyle products curated just for you. Free shipping on orders over $50.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/category/all">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/category/trending">Trending</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/categories" className="text-indigo-600 font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
             {Array.from({length: 8}).map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
             {MAIN_CATEGORIES.slice(0, 8).map(cat => (
              <Link key={cat.id} to={`/category/${cat.id}`} className="group block relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="text-white font-medium text-lg">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          </div>
        </div>
        {loading ? (
          <div>
            <p className="text-gray-500 mb-4 animate-pulse">Loading products...</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {Array.from({length: 4}).map((_, i) => <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>)}
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 mb-3" />
            <p className="font-medium mb-4">Error loading products: {error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="bg-white text-red-600 border-red-200 hover:bg-red-50">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center">
            <p className="mb-4 text-lg">No products found.</p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} variant="outline">
                 <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              <Button onClick={async () => {
                setLoading(true);
                const seeded = await seedDemoProducts();
                if (seeded) window.location.reload();
                else setLoading(false);
              }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Zap className="w-4 h-4 mr-2" /> Add Demo Products
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
