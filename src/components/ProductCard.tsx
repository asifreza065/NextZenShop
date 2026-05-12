import React from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from './ui/button';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'sonner';
import { ProductImage } from './ProductImage';

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  categoryId?: string;
  subCategory?: string;
  description?: string;
}

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock
    });
    toast.success('Added to cart');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info('Wishlist feature coming soon');
  };

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative border-b border-gray-50">
        <ProductImage 
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} 
          alt={product.name}
          containerClassName="aspect-square w-full p-4"
          imageClassName="group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <button 
            onClick={handleWishlist}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-gray-600 hover:text-red-500 transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-30">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded z-30">
            Out of Stock
          </div>
        )}
        {product.discountPrice && (
          <div className="absolute bottom-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-30">
            Sale
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col bg-white">
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
        </div>
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900 leading-none">{formatPrice(product.discountPrice || product.price)}</span>
            {product.discountPrice && (
              <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(product.price)}</span>
            )}
          </div>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 rounded-full flex-shrink-0" 
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
