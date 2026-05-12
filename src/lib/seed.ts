import { doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { MAIN_CATEGORIES } from './categories';
import { toast } from 'sonner';

export const seedDemoProducts = async () => {
  try {
    const batch = writeBatch(db);
    
    // Seed Categories
    MAIN_CATEGORIES.forEach(cat => {
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
      { id: 'p2', categoryId: 'electronics', subCategory: 'Smartphones', name: 'Samsung Galaxy S25 Ultra', price: 1299.00, images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80'], description: 'The ultimate Galaxy experience with AI.', stock: 15, rating: 4.8, reviewCount: 310 },
      { id: 'p3', categoryId: 'electronics', subCategory: 'Laptops', name: 'MacBook Pro M4', price: 1599.00, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80'], description: 'Supercharged by M4. The most advanced Mac ever.', stock: 10, rating: 5.0, reviewCount: 150 },
      { id: 'p4', categoryId: 'gaming', subCategory: 'Gaming Laptops', name: 'ASUS ROG Gaming Laptop', price: 1999.00, images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80'], description: 'Ultimate gaming performance with RTX 4090.', stock: 5, rating: 4.7, reviewCount: 89 },
      { id: 'p5', categoryId: 'electronics', subCategory: 'Audio', name: 'AirPods Pro', price: 249.00, images: ['https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=500&q=80'], description: 'Active Noise Cancellation and immersive sound.', stock: 50, rating: 4.9, reviewCount: 1205 },
      { id: 'p6', categoryId: 'fashion', subCategory: 'Men\'s Clothing', name: 'Classic Leather Jacket', price: 199.99, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80'], description: 'Premium leather outerwear for men.', stock: 15, rating: 4.7, reviewCount: 89 },
      { id: 'p7', categoryId: 'components', subCategory: 'RAM', name: 'Corsair Vengeance 32GB DDR5', price: 145.00, images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80'], description: 'High performance desktop memory.', stock: 50, rating: 4.8, reviewCount: 156 },
      { id: 'p8', categoryId: 'gaming', subCategory: 'Gaming Consoles', name: 'PlayStation 5 Console', price: 499.00, images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80'], description: 'Next-gen gaming power.', stock: 0, rating: 4.9, reviewCount: 2210 }
    ];

    sampleProducts.forEach(prod => {
      const ref = doc(db, 'products', prod.id);
      batch.set(ref, {
        ...prod,
        description: prod.description || 'This is a premium product with exceptional quality. Includes standard warranty and free shipping. Buy now and experience the difference.',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFeatured: true,
        isTrending: true,
        status: 'Published'
      });
    });

    await batch.commit();
    return true;
  } catch (error: any) {
    console.error('Error seeding data:', error);
    toast.error('Failed to seed demo data automatically.');
    return false;
  }
};
