import { Link } from 'react-router';
import { useCartStore } from '../store/useCartStore';
import { Button } from '../components/ui/button';
import { formatPrice } from '../lib/utils';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

export function Cart() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our products and find something you love.</p>
        <Button asChild size="lg">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md bg-gray-50" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 line-clamp-1 pr-8">{item.name}</h3>
                  <p className="text-indigo-600 font-bold mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1.5 text-gray-500 hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                      className="p-1.5 text-gray-500 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
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
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </div>
            <Button className="w-full h-12 text-base" asChild>
              <Link to="/checkout">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy import to ensure it works for the empty state
import { ShoppingCart } from 'lucide-react';
