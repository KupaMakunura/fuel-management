import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;

  login: () => void;
  logout: () => void;
}

const persistedAuthStore = persist<AuthState>(
  (set) => ({
    isLoggedIn: true,
    login: () => set({ isLoggedIn: true }),
    logout: () => set({ isLoggedIn: false }),
  }),
  {
    name: "nfms-auth-store",
    storage: createJSONStorage(() => localStorage),
  }
);
export const useAuthStore = create(persistedAuthStore);
