import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Package, Clock, CheckCircle, Settings, User } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export function Dashboard() {
  const { user, profile, setProfile } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  // Profile Edit State
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhotoURL(profile.photoURL || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const fetchedOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        fetchedOrders.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setOrders(fetchedOrders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdatingProfile(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL,
        updatedAt: Date.now()
      });
      setProfile({ ...profile, displayName, photoURL });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-gray-600">Please sign in to view your dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || 'User'}&background=random`} 
              alt="Profile" 
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-gray-900 truncate">{profile?.displayName || 'User'}</h3>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2 p-2 rounded-md font-medium transition-colors ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className="w-5 h-5" />
              My Orders
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2 p-2 rounded-md font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'orders' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
            {loading ? (
              <div className="space-y-4">
                {Array.from({length: 3}).map((_,i) => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">When you place orders, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Order Placed</p>
                        <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                        <p className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Order #</p>
                        <p className="font-medium text-gray-900">{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-blue-100 text-blue-700'}`}>
                          {order.status === 'delivered' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 divide-y divide-gray-100">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover bg-gray-50 rounded" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 line-clamp-1"><Link to={`/product/${item.id}`} className="hover:text-indigo-600 transition-colors">{item.name}</Link></h4>
                            <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                          </div>
                          <div className="font-medium text-gray-900">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={user.email || ''} disabled className="bg-gray-50 text-gray-500" />
                <p className="text-xs text-gray-500">Email cannot be changed here.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photoURL">Avatar Photo URL</Label>
                <Input id="photoURL" value={photoURL} onChange={e => setPhotoURL(e.target.value)} placeholder="https://example.com/avatar.png" />
              </div>
              
              <Button type="submit" disabled={updatingProfile}>
                {updatingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
