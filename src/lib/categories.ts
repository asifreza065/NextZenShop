import { 
  Smartphone, Cpu, Shirt, Home, Headphones, Gamepad2, 
  Sparkles, Dumbbell, BookOpen, Baby, ShoppingBasket, Car 
} from 'lucide-react';

export const MAIN_CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: Smartphone,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80',
    subcategories: ['Smartphones', 'Laptops', 'Gaming PCs', 'Monitors', 'Keyboards', 'Mouse', 'Headphones', 'Smart Watches', 'Cameras', 'Speakers', 'Power Banks', 'Routers']
  },
  {
    id: 'components',
    name: 'Computer Components',
    icon: Cpu,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80',
    subcategories: ['RAM', 'SSD', 'HDD', 'Graphics Cards', 'Processors', 'Motherboards', 'Power Supplies', 'CPU Coolers', 'PC Cases']
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80',
    subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Bags', 'Watches', 'Sunglasses', 'Jewelry']
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80',
    subcategories: ['Furniture', 'Home Decor', 'Kitchen Tools', 'Lighting', 'Storage Items']
  },
  {
    id: 'mobile-accessories',
    name: 'Mobile Accessories',
    icon: Headphones,
    image: 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d06c?w=500&q=80',
    subcategories: ['Phone Cases', 'Chargers', 'Earbuds', 'Screen Protectors', 'Cables']
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: Gamepad2,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=80',
    subcategories: ['Gaming Consoles', 'Gaming Chairs', 'Controllers', 'Gaming Accessories']
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54c28?w=500&q=80',
    subcategories: ['Skincare', 'Hair Care', 'Perfumes', 'Makeup']
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    icon: Dumbbell,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80',
    subcategories: ['Gym Equipment', 'Sports Wear', 'Bicycles', 'Yoga Accessories']
  },
  {
    id: 'books',
    name: 'Books & Education',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80',
    subcategories: ['Academic Books', 'Novels', 'Programming Books', 'Stationery']
  },
  {
    id: 'kids',
    name: 'Kids & Toys',
    icon: Baby,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80',
    subcategories: ['Toys', 'Baby Products', 'School Bags']
  },
  {
    id: 'grocery',
    name: 'Grocery & Food',
    icon: ShoppingBasket,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
    subcategories: ['Snacks', 'Beverages', 'Instant Food']
  },
  {
    id: 'automotive',
    name: 'Automotive',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&q=80',
    subcategories: ['Bike Accessories', 'Car Accessories', 'Tools']
  }
];
