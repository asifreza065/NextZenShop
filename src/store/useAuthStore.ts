import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  profile: any | null; // From Firestore
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set((state) => ({ 
    profile, 
    isAdmin: profile?.role === 'admin' || state.user?.email === 'freefire074260@gmail.com' 
  })),
  setLoading: (loading) => set({ loading }),
}));
