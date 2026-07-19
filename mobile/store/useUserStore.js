import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasSeenWelcome: false,

      setUser: (userData) => set({ user: userData }),
      setAuth: ({ user, token }) => set({ user, token }),

      markWelcomeSeen: () => set({ hasSeenWelcome: true }),

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'yuma-user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        hasSeenWelcome: state.hasSeenWelcome,
      }),
    }
  )
);
