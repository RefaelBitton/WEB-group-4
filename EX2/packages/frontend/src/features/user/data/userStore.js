import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  
  setUser: (user, token) => set({ user, token, error: null }),
  
  logout: () => set({ user: null, token: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));
