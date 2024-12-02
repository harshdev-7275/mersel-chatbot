import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the shape of your store's state
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

// Create the Zustand store with persist middleware
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, // Default state
      setToken: (token: string) => {
        console.log("Setting token:", token); // Debug log
        set({ token });
      },
      clearToken: () => {
        console.log("Clearing token"); // Debug log
        set({ token: null });
      },
    }),
    {
      name: 'auth-storage', // Key used in localStorage
      onRehydrateStorage: () => (state) => {
        console.log("Rehydration complete:", state); // Debug when hydration is done
      },
    }
  )
);

export default useAuthStore;
