import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductCard, type Product } from '../components/ProductCard';
import { Search, Filter, ChevronRight, Tags } from 'lucide-react';
import { MAIN_CATEGORIES } from '../lib/categories';

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const subQuery = searchParams.get('sub');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentCategory = MAIN_CATEGORIES.find(c => c.id === id);
  const categoryName = currentCategory ? currentCategory.name : (id === 'search' ? `Search Results for "${searchQuery}"` : 'All Products');
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let q = query(collection(db, 'products'));
    
    if (id && id !== 'all' && id !== 'search') {
      q = query(collection(db, 'products'), where('categoryId', '==', id));
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));

      if (id === 'search' && searchQuery) {
        docs = docs.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      if (subQuery) {
        docs = docs.filter(p => p.subCategory === subQuery);
      }

      setProducts(docs);
      setLoading(false);
    }, (err: any) => {
      console.error(err);
      setError(err.message || 'Failed to fetch products');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, searchQuery, subQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {currentCategory && <currentCategory.icon className="w-8 h-8 text-indigo-600" />}
            {categoryName}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/categories" className="hover:text-indigo-600">Categories</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{categoryName}</span>
            {subQuery && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">{subQuery}</span>
              </>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`w-full md:w-64 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          {currentCategory && (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tags className="w-4 h-4" />
                Subcategories
              </h3>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('sub');
                      setSearchParams(newParams);
                      setShowMobileFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!subQuery ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All {currentCategory.name}
                  </button>
                </li>
                {currentCategory.subcategories.map(sub => (
                  <li key={sub}>
                    <button 
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('sub', sub);
                        setSearchParams(newParams);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${subQuery === sub ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-500 font-medium">{products.length} products found</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {Array.from({length: 8}).map((_, i) => <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : error ? (
            <div className="py-20 text-center flex flex-col items-center bg-red-50 rounded-2xl border border-red-100">
              <p className="text-red-600 font-medium mb-4">Error loading products: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded hover:bg-red-50"
              >
                Retry
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {products.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 text-sm mb-4">We couldn't find any products in this subcategory.</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {subQuery && (
                  <button 
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('sub');
                      setSearchParams(newParams);
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-white transition-colors"
                  >
                    View all in {currentCategory?.name || 'Category'}
                  </button>
                )}
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
