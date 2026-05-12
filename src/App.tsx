import { useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'sonner';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CategoryPage } from './pages/CategoryPage';
import { AllCategories } from './pages/AllCategories';

export default function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch profile
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading]);

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="categories" element={<AllCategories />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="category/:id" element={<CategoryPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="dashboard/*" element={<Dashboard />} />
          <Route path="admin/*" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
