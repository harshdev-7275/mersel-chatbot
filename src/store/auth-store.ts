import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the shape of your store's state
interface AuthState {
  token: string | null;
  user_id: string | null;
  setToken: (token: string) => void;
  setUserId: (user_id: string) => void;
  clearToken: () => void;
}

// Create the Zustand store with persist middleware
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, // Default state for token
      user_id: null, // Default state for user_id
      setToken: (token: string) => {
        console.log("Setting token:", token); // Debug log
        set({ token });
      },
      setUserId: (user_id: string) => {
        console.log("Setting user_id:", user_id); // Debug log
        set({ user_id });
      },
      clearToken: () => {
        console.log("Clearing token"); // Debug log
        set({ token: null, user_id: null }); // Clear both token and user_id
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
