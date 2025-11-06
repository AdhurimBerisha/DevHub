import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          isAdmin: user?.role === "ADMIN",
        });
      },

      setToken: (token) => set({ token }),

      setLoading: (isLoading) => set({ isLoading }),

      login: (user, token) => {
        set({
          user,
          token: null,
          isAuthenticated: true,
          isAdmin: user.role === "ADMIN",
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,

        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
