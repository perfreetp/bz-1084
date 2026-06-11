import { create } from "zustand";
import { getStorage, setStorage } from "@/utils/storage";
import type { User, Schedule, UserSettings } from "@/types";

const defaultUser: User = {
  id: "user_001",
  username: "壁纸爱好者",
  email: "user@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  bio: "热爱收集美丽的壁纸",
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  schedule: {
    enabled: false,
    interval: "daily",
    sourceType: "favorites",
  },
  settings: {
    darkPreview: false,
    autoDownload: false,
    defaultResolution: "1080P FHD",
    notifications: {
      subscriptionUpdate: true,
      favoriteReminder: true,
      weeklyDigest: false,
      systemNotice: true,
    },
  },
};

interface UserState {
  user: User;
  isLoggedIn: boolean;
  initFromStorage: () => void;
  updateProfile: (data: Partial<Pick<User, "username" | "email" | "avatarUrl" | "bio">>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateSchedule: (schedule: Partial<Schedule>) => void;
  updateNotifications: (notifications: Partial<UserSettings["notifications"]>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: defaultUser,
  isLoggedIn: true,

  initFromStorage: () => {
    const user = getStorage<User>("user", defaultUser);
    set({ user });
  },

  updateProfile: (data) => {
    set((state) => {
      const user = { ...state.user, ...data };
      setStorage("user", user);
      return { user };
    });
  },

  updateSettings: (settings) => {
    set((state) => {
      const user = { ...state.user, settings: { ...state.user.settings, ...settings } };
      setStorage("user", user);
      return { user };
    });
  },

  updateSchedule: (schedule) => {
    set((state) => {
      const user = { ...state.user, schedule: { ...state.user.schedule, ...schedule } };
      setStorage("user", user);
      return { user };
    });
  },

  updateNotifications: (notifications) => {
    set((state) => {
      const user = {
        ...state.user,
        settings: {
          ...state.user.settings,
          notifications: { ...state.user.settings.notifications, ...notifications },
        },
      };
      setStorage("user", user);
      return { user };
    });
  },
}));
