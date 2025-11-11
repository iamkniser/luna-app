import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { OnboardingData, User } from "@/src/types/user";

interface UserStore {
  user: User | null;
  isLoading: boolean;
  completeOnboarding: (data: OnboardingData) => void;
  updateUser: (data: Partial<User>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      completeOnboarding: (data: OnboardingData) => {
        const newUser: User = {
          id: Date.now().toString(),
          name: data.name || "Пользователь",
          onboardingCompleted: true,
          lastPeriodDate: data.lastPeriodDate,
          averageCycleLength: data.averageCycleLength,
          createdAt: new Date().toISOString(),
        };
        set({ user: newUser });
      },
      updateUser: (data: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
      clearUser: () => {
        set({ user: null });
      },
    }),
    {
      name: "luna-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
