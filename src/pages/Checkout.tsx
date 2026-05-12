import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { formatPrice } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please log in to checkout');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.fullName || !shippingInfo.addressLine1 || !shippingInfo.city || !shippingInfo.zipCode) {
      toast.error('Please fill all required shipping fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user.uid,
        items,
        totalAmount: getTotal(),
        status: 'pending',
        shippingAddress: shippingInfo,
        paymentMethod,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);
      clearCart();
      setSuccess(true);
      toast.success('Order placed successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">Thank you for your purchase. Your order #{orderId.slice(0, 8).toUpperCase()} is currently being processed.</p>
        <Button onClick={() => navigate('/dashboard')} size="lg">Manage Orders</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={shippingInfo.fullName} onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressLine1">Street Address</Label>
                <Input id="addressLine1" value={shippingInfo.addressLine1} onChange={e => setShippingInfo({...shippingInfo, addressLine1: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={shippingInfo.city} onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input id="state" value={shippingInfo.state} onChange={e => setShippingInfo({...shippingInfo, state: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                <Input id="zipCode" value={shippingInfo.zipCode} onChange={e => setShippingInfo({...shippingInfo, zipCode: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={shippingInfo.country} onChange={e => setShippingInfo({...shippingInfo, country: e.target.value})} disabled />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-indigo-600 focus:ring-indigo-500" />
                <span className="font-medium text-gray-900">Cash on Delivery</span>
              </label>
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer opacity-50`}>
                <input type="radio" name="paymentMethod" disabled className="text-indigo-600 focus:ring-indigo-500" />
                <span className="font-medium text-gray-900 flex-1">Credit Card</span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Coming Soon</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 pr-4">{item.quantity} x {item.name}</span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-gray-200 my-4"></div>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="h-px bg-gray-200 my-4"></div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
