import { Package } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-indigo-400" />
            NextZenShop
          </Link>
          <p className="text-sm text-gray-400">
            Your one-stop destination for modern, premium tech and lifestyle products.
            Experience seamless shopping.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/categories" className="hover:text-white transition-colors">All Categories</Link></li>
            <li><Link to="/category/electronics" className="hover:text-white transition-colors">Electronics</Link></li>
            <li><Link to="/category/components" className="hover:text-white transition-colors">Computer Components</Link></li>
            <li><Link to="/category/fashion" className="hover:text-white transition-colors">Fashion</Link></li>
            <li><Link to="/category/home" className="hover:text-white transition-colors">Home & Living</Link></li>
            <li><Link to="/category/gaming" className="hover:text-white transition-colors">Gaming</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping Returns</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Order Tracking</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
        &copy; {new Date().getFullYear()} NextZenShop. All rights reserved.
      </div>
    </footer>
  );
}
