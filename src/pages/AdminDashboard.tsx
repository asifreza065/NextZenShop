import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../lib/firebase';
import { doc, setDoc, writeBatch, collection, getDocs, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { formatPrice } from '../lib/utils';
import { ProductForm } from '../components/admin/ProductForm';
import { Search, Filter, Trash2, Edit, Plus, ChevronLeft, ChevronRight, LayoutDashboard, Package, Users, Settings as SettingsIcon, ShoppingBag, Folders } from 'lucide-react';
import { MAIN_CATEGORIES } from '../lib/categories';

export function AdminDashboard() {
  const { isAdmin, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'users'>('overview');
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!isAdmin) return;
    
    // Always fetch products to get counts
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error(err);
    });

    let unsubOrders = () => {};
    if (activeTab === 'orders' || activeTab === 'overview') {
      unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    let unsubUsers = () => {};
    if (activeTab === 'users' || activeTab === 'overview') {
      unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    let unsubCategories = () => {};
    if (activeTab === 'categories') {
      unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
      unsubCategories();
    };
  }, [activeTab, isAdmin]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? p.categoryId === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSaveProduct = () => {
    setIsFormOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if(!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
      setProducts(p => p.filter(x => x.id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-gray-500">Access Denied. Admins only.</div>;
  }

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      const categoriesData = MAIN_CATEGORIES;

      categoriesData.forEach(cat => {
        const ref = doc(db, 'categories', cat.id);
        batch.set(ref, {
          name: cat.name,
          image: cat.image || '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      });

      const sampleProducts = [
        { id: 'p1', categoryId: 'electronics', subCategory: 'Smartphones', name: 'iPhone 15 Pro Max', price: 1199.00, images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80'], description: 'Titanium design, powerful A17 Pro chip.', stock: 20, rating: 4.9, reviewCount: 420 },
        { id: 'p2', categoryId: 'components', subCategory: 'RAM', name: 'Corsair Vengeance 32GB DDR5', price: 145.00, images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80'], description: 'High performance desktop memory.', stock: 50, rating: 4.8, reviewCount: 156 },
        { id: 'p3', categoryId: 'fashion', subCategory: 'Men\'s Clothing', name: 'Classic Leather Jacket', price: 199.99, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80'], description: 'Premium leather outerwear for men.', stock: 15, rating: 4.7, reviewCount: 89 },
        { id: 'p4', categoryId: 'home', subCategory: 'Furniture', name: 'Ergonomic Office Chair', price: 299.00, images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80'], description: 'Designed for comfort and back support over long hours.', stock: 5, rating: 4.5, reviewCount: 34 },
        { id: 'p5', categoryId: 'mobile-accessories', subCategory: 'Chargers', name: 'Anker Fast Wireless Charger', price: 29.99, images: ['https://images.unsplash.com/photo-1584006682522-dc17d6c0d06c?w=500&q=80'], description: 'Qi-certified wireless charging stand.', stock: 80, rating: 4.6, reviewCount: 42 },
        { id: 'p6', categoryId: 'gaming', subCategory: 'Gaming Consoles', name: 'PlayStation 5 Console', price: 499.00, images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80'], description: 'Next-gen gaming power.', stock: 0, rating: 4.9, reviewCount: 2210 },
        { id: 'p7', categoryId: 'beauty', subCategory: 'Skincare', name: 'Hydrating Face Wash', price: 18.00, images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80'], description: 'Gentle cleanser for all skin types.', stock: 120, rating: 4.8, reviewCount: 77 },
        { id: 'p8', categoryId: 'sports', subCategory: 'Gym Equipment', name: 'Adjustable Dumbbell Set', price: 149.00, images: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80'], description: 'Space-saving home gym essential.', stock: 25, rating: 4.7, reviewCount: 112 },
        { id: 'p9', categoryId: 'books', subCategory: 'Programming Books', name: 'Clean Code by Robert C. Martin', price: 42.00, images: ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80'], description: 'A handbook of agile software craftsmanship.', stock: 45, rating: 4.9, reviewCount: 320 },
        { id: 'p10', categoryId: 'kids', subCategory: 'Toys', name: 'Lego Star Wars Millennium Falcon', price: 159.00, images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80'], description: 'Iconic building set for fans.', stock: 12, rating: 4.9, reviewCount: 88 },
        { id: 'p11', categoryId: 'grocery', subCategory: 'Beverages', name: 'Premium Espresso Coffee Beans 1kg', price: 24.50, images: ['https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80'], description: 'Rich and aromatic medium roast.', stock: 200, rating: 4.8, reviewCount: 56 },
        { id: 'p12', categoryId: 'automotive', subCategory: 'Car Accessories', name: 'HD Dual Dash Cam', price: 89.00, images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&q=80'], description: 'Front and rear recording for security.', stock: 35, rating: 4.5, reviewCount: 65 },
        { id: 'p13', categoryId: 'electronics', subCategory: 'Smartphones', name: 'Premium Electronics', price: 299.99, images: ['https://i.ibb.co.com/b5sYFPpf/61mh-BSKOin-L-AC-SL1500.jpg'], description: 'High quality electronics.', stock: 15, rating: 4.8, reviewCount: 22 },
      ];

      sampleProducts.forEach(prod => {
        const ref = doc(db, 'products', prod.id);
        batch.set(ref, {
          ...prod,
          description: 'This is a premium product with exceptional quality. Includes standard warranty and free shipping. Buy now and experience the difference.',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isFeatured: true,
          isTrending: true,
          status: 'Published'
        });
      });

      await batch.commit();
      toast.success('Sample data seeded successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const SidebarNav = () => {
    const tabs = [
      { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
      { id: 'products', label: 'Products', icon: <Package className="w-5 h-5 mr-3" /> },
      { id: 'categories', label: 'Categories', icon: <Folders className="w-5 h-5 mr-3" /> },
      { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5 mr-3" /> },
      { id: 'users', label: 'Users', icon: <Users className="w-5 h-5 mr-3" /> },
    ];

    return (
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden">
          <div className="p-6 bg-indigo-600">
            <h3 className="font-bold text-white text-xl">NextZenShop</h3>
            <p className="text-indigo-200 text-sm mt-1">Admin Panel</p>
          </div>
          <nav className="p-4 space-y-1">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  if (activeTab === 'products' && isFormOpen) setIsFormOpen(false);
                  setActiveTab(tab.id as any);
                }}
                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full flex flex-col md:flex-row gap-8 bg-gray-50 min-h-screen">
      <SidebarNav />

      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center rounded-lg">
                    <Folders className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{MAIN_CATEGORIES.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Setup</h3>
              <p className="text-sm text-gray-600 mb-6">Populate the database with demo products and categories to see how the store looks.</p>
              <Button onClick={handleSeedData} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {loading ? 'Seeding Database...' : 'Add Demo Content'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            {isFormOpen ? (
              <ProductForm 
                product={editingProduct} 
                onClose={() => setIsFormOpen(false)} 
                onSave={handleSaveProduct} 
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products Catalog</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all products in your store</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleSeedData} disabled={loading}>
                      {loading ? 'Adding...' : 'Add Demo Products'}
                    </Button>
                    <Button onClick={handleAddProduct} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Add New Product
                    </Button>
                  </div>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Search by product name, SKU, or brand..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-colors"
                    >
                      <option value="">All Categories</option>
                      {MAIN_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center p-16 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">We couldn't find any products matching your search criteria. Try adjusting your filters or add a new product.</p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => { setSearchTerm(''); setCategoryFilter(''); }}>
                        Clear Filters
                      </Button>
                      <Button variant="default" onClick={handleSeedData} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading ? 'Adding...' : 'Add Demo Products'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Product</th>
                            <th className="px-6 py-4 font-semibold text-center">Status</th>
                            <th className="px-6 py-4 font-semibold text-center">Price</th>
                            <th className="px-6 py-4 font-semibold text-center">Stock</th>
                            <th className="px-6 py-4 font-semibold text-center">Category</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedProducts.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                    {p.images && p.images.length > 0 ? (
                                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <span className="text-xs">No img</span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="line-clamp-1 text-sm font-semibold">{p.name}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-normal flex items-center gap-2">
                                      {p.sku && <span>SKU: {p.sku}</span>}
                                      {p.brand && <span>• {p.brand}</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-medium border ${
                                  p.status === 'Published' || p.status === undefined ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>
                                  {p.status || 'Published'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="font-semibold text-gray-900">{formatPrice(p.salePrice || p.discountPrice || p.price)}</div>
                                {(p.salePrice || p.discountPrice) && <div className="text-xs text-gray-400 line-through mt-0.5">{formatPrice(p.price)}</div>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md text-xs font-bold border ${
                                  p.stock > 10 ? 'bg-green-50 text-green-700 border-green-200' : 
                                  p.stock > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {p.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="capitalize inline-flex text-gray-600 text-xs font-medium">
                                  {MAIN_CATEGORIES.find(c => c.id === p.categoryId)?.name || p.categoryId}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleEditProduct(p)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors border border-transparent hover:border-indigo-100">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                      <div className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium text-gray-900">{filteredProducts.length}</span> entries
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={currentPage === totalPages || totalPages === 0}
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        >
                          Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories Management</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {MAIN_CATEGORIES.map(cat => (
                <div key={cat.id} className="border border-gray-200 rounded-xl overflow-hidden group flex flex-col">
                  {cat.image ? (
                    <div className="h-32 bg-gray-100 relative overflow-hidden">
                      <img src={cat.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : (
                    <div className="h-32 bg-indigo-50 flex flex-col items-center justify-center text-indigo-300">
                      <Folders className="w-10 h-10 mb-2" />
                    </div>
                  )}
                  <div className="p-4 bg-white flex-1 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                      <p className="text-xs text-gray-500">{cat.subcategories?.length || 0} subcategories</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Registered Users</h1>
            {users.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4 text-center">Role</th>
                      <th className="px-6 py-4 text-center">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{u.name || 'Anonymous User'}</div>
                          <div className="text-xs text-gray-500">{u.email || u.id}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-500 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h1>
            {orders.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders have been placed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Order ID & Date</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4 text-center">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{o.id}</div>
                          <div className="text-xs text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{o.shippingInfo?.fullName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{o.userId}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-900">
                          {formatPrice(o.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold capitalize
                            ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                              o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                              'bg-yellow-100 text-yellow-700'}
                          `}>
                            {o.status || 'Processing'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

