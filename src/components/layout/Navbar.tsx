import React from 'react';
import { Link, useNavigate } from 'react-router';
import { ShoppingCart, Search, Menu, User, LogOut, Package, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Button } from '../ui/button';

export function Navbar() {
  const cartItems = useCartStore((state) => state.items);
  const { user, profile, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/search?q=${searchQuery}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
            <Package className="w-6 h-6" />
            <span className="hidden sm:block">NextZenShop</span>
          </Link>
          <Link to="/categories" className="hidden lg:block ml-4 text-sm font-medium text-gray-600 hover:text-gray-900">
            Categories
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
          </form>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link to="/admin" className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600">
                <User className="w-4 h-4" />
                Account
              </Link>
              <button onClick={handleLogout} className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</Link>
              <Button asChild size="sm">
                <Link to="/signup">Register</Link>
              </Button>
            </div>
          )}

          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg p-4 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </form>
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">My Account</Link>
                {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">Admin Dashboard</Link>}
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="p-2 hover:bg-gray-50 rounded-md text-sm font-medium text-red-600 text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">Sign in</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-md text-sm font-medium text-indigo-600">Create account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
