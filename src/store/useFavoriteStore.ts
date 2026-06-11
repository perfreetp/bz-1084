import { create } from "zustand";
import { getStorage, setStorage } from "@/utils/storage";
import type {
  FavoriteGroup,
  Favorite,
  Download,
  Subscription,
  FollowedTag,
  Feedback,
  NotificationMessage,
  CopyrightType,
} from "@/types";

interface FavoriteState {
  groups: FavoriteGroup[];
  favorites: Favorite[];
  downloads: Download[];
  subscriptions: Subscription[];
  followedTags: FollowedTag[];
  feedback: Feedback[];
  notifications: NotificationMessage[];

  initFromStorage: () => void;

  createGroup: (name: string, description?: string) => void;
  deleteGroup: (groupId: string) => void;
  updateGroup: (groupId: string, data: Partial<FavoriteGroup>) => void;

  addToFavorites: (wallpaperId: string, groupId?: string) => void;
  removeFromFavorites: (favoriteId: string) => void;
  removeWallpaperFromAll: (wallpaperId: string) => void;
  isWallpaperFavorited: (wallpaperId: string) => boolean;
  getWallpaperFavoriteGroup: (wallpaperId: string) => FavoriteGroup | undefined;
  getFavoritesByGroup: (groupId: string) => Favorite[];
  batchMoveFavorites: (favoriteIds: string[], targetGroupId: string) => void;
  batchRemoveFavorites: (favoriteIds: string[]) => void;

  addDownload: (
    wallpaperId: string,
    resolution: string,
    watermark?: boolean,
    wallpaperTitle?: string,
    wallpaperThumbnail?: string,
    authorId?: string,
    authorName?: string,
    copyrightType?: CopyrightType
  ) => void;
  clearDownloads: (beforeDate?: string) => void;
  getDownloadedWallpaperIds: () => string[];

  subscribe: (authorId: string) => void;
  unsubscribe: (authorId: string) => void;
  isSubscribed: (authorId: string) => boolean;

  followTag: (tagId: string, tagName: string) => void;
  unfollowTag: (tagId: string) => void;
  isTagFollowed: (tagId: string) => boolean;

  submitFeedback: (data: Omit<Feedback, "id" | "status" | "createdAt">) => void;

  addNotification: (notification: Omit<NotificationMessage, "id" | "read" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;
  getNotificationsByAuthor: (authorId: string) => NotificationMessage[];
}

const defaultGroups: FavoriteGroup[] = [
  { id: "default", name: "默认收藏", description: "系统默认收藏夹", createdAt: new Date().toISOString() },
  { id: "fav_nature", name: "自然风光", description: "喜欢的自然风景壁纸", createdAt: new Date().toISOString() },
  { id: "fav_anime", name: "动漫收藏", description: "动漫插画类壁纸", createdAt: new Date().toISOString() },
];

const seedNotifications: NotificationMessage[] = [
  {
    id: "n_1",
    type: "subscription_update",
    authorId: "a1",
    authorName: "星河漫步",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    wallpaperId: "w1",
    wallpaperTitle: "极光山脉",
    wallpaperThumbnail: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=400&h=225&fit=crop",
    title: "星河漫步 发布了新壁纸",
    description: "「极光山脉」— 挪威北部极光下的雪山",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n_2",
    type: "subscription_update",
    authorId: "a4",
    authorName: "城市猎人",
    authorAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    wallpaperId: "w10",
    wallpaperTitle: "城市夜景",
    wallpaperThumbnail: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=225&fit=crop",
    title: "城市猎人 发布了新壁纸",
    description: "「城市夜景」— 曼哈顿天际线的璀璨夜景",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n_3",
    type: "subscription_update",
    authorId: "a5",
    authorName: "梦幻画师",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    wallpaperId: "w15",
    wallpaperTitle: "超现实风景",
    wallpaperThumbnail: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=225&fit=crop",
    title: "梦幻画师 发布了新壁纸",
    description: "「超现实风景」— 超现实主义风格的梦幻风景插画",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n_4",
    type: "subscription_update",
    authorId: "a2",
    authorName: "Pixel Artist",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    wallpaperId: "w2",
    wallpaperTitle: "赛博都市",
    wallpaperThumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
    title: "Pixel Artist 发布了新壁纸",
    description: "「赛博都市」— 霓虹灯下的未来都市",
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n_5",
    type: "system",
    title: "系统公告",
    description: " WallpaperHub 2.0 已上线，新增来源订阅和下载管理功能",
    read: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n_6",
    type: "weekly_digest",
    title: "本周精选壁纸",
    description: "本周最受欢迎的 10 张壁纸已出炉，快来看看吧",
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  groups: defaultGroups,
  favorites: [],
  downloads: [],
  subscriptions: [],
  followedTags: [],
  feedback: [],
  notifications: [],

  initFromStorage: () => {
    const groups = getStorage<FavoriteGroup[]>("groups", defaultGroups);
    const favorites = getStorage<Favorite[]>("favorites", []);
    const downloads = getStorage<Download[]>("downloads", []);
    const subscriptions = getStorage<Subscription[]>("subscriptions", []);
    const followedTags = getStorage<FollowedTag[]>("followedTags", []);
    const feedback = getStorage<Feedback[]>("feedback", []);
    const notifications = getStorage<NotificationMessage[]>("notifications", seedNotifications);
    set({ groups, favorites, downloads, subscriptions, followedTags, feedback, notifications });
  },

  createGroup: (name, description) => {
    const newGroup: FavoriteGroup = {
      id: "g_" + Date.now(),
      name,
      description,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const groups = [...state.groups, newGroup];
      setStorage("groups", groups);
      return { groups };
    });
  },

  deleteGroup: (groupId) => {
    set((state) => {
      const groups = state.groups.filter((g) => g.id !== groupId);
      const favorites = state.favorites.filter((f) => f.groupId !== groupId);
      setStorage("groups", groups);
      setStorage("favorites", favorites);
      return { groups, favorites };
    });
  },

  updateGroup: (groupId, data) => {
    set((state) => {
      const groups = state.groups.map((g) => (g.id === groupId ? { ...g, ...data } : g));
      setStorage("groups", groups);
      return { groups };
    });
  },

  addToFavorites: (wallpaperId, groupId) => {
    const gid = groupId || "default";
    if (get().isWallpaperFavorited(wallpaperId)) return;
    const newFavorite: Favorite = {
      id: "f_" + Date.now(),
      wallpaperId,
      groupId: gid,
      addedAt: new Date().toISOString(),
    };
    set((state) => {
      const favorites = [...state.favorites, newFavorite];
      setStorage("favorites", favorites);
      return { favorites };
    });
  },

  removeFromFavorites: (favoriteId) => {
    set((state) => {
      const favorites = state.favorites.filter((f) => f.id !== favoriteId);
      setStorage("favorites", favorites);
      return { favorites };
    });
  },

  removeWallpaperFromAll: (wallpaperId) => {
    set((state) => {
      const favorites = state.favorites.filter((f) => f.wallpaperId !== wallpaperId);
      setStorage("favorites", favorites);
      return { favorites };
    });
  },

  isWallpaperFavorited: (wallpaperId) => {
    return get().favorites.some((f) => f.wallpaperId === wallpaperId);
  },

  getWallpaperFavoriteGroup: (wallpaperId) => {
    const fav = get().favorites.find((f) => f.wallpaperId === wallpaperId);
    if (!fav) return undefined;
    return get().groups.find((g) => g.id === fav.groupId);
  },

  getFavoritesByGroup: (groupId) => {
    return get().favorites.filter((f) => f.groupId === groupId);
  },

  batchMoveFavorites: (favoriteIds, targetGroupId) => {
    set((state) => {
      const favorites = state.favorites.map((f) =>
        favoriteIds.includes(f.id) ? { ...f, groupId: targetGroupId } : f
      );
      setStorage("favorites", favorites);
      return { favorites };
    });
  },

  batchRemoveFavorites: (favoriteIds) => {
    set((state) => {
      const favorites = state.favorites.filter((f) => !favoriteIds.includes(f.id));
      setStorage("favorites", favorites);
      return { favorites };
    });
  },

  addDownload: (wallpaperId, resolution, watermark, wallpaperTitle, wallpaperThumbnail, authorId, authorName, copyrightType) => {
    const newDownload: Download = {
      id: "d_" + Date.now(),
      wallpaperId,
      resolution,
      downloadedAt: new Date().toISOString(),
      watermark,
      wallpaperTitle,
      wallpaperThumbnail,
      authorId,
      authorName,
      copyrightType,
    };
    set((state) => {
      const downloads = [newDownload, ...state.downloads];
      setStorage("downloads", downloads);
      return { downloads };
    });
  },

  clearDownloads: (beforeDate) => {
    set((state) => {
      let downloads = state.downloads;
      if (beforeDate) {
        const before = new Date(beforeDate).getTime();
        downloads = downloads.filter((d) => new Date(d.downloadedAt).getTime() >= before);
      } else {
        downloads = [];
      }
      setStorage("downloads", downloads);
      return { downloads };
    });
  },

  getDownloadedWallpaperIds: () => {
    return get().downloads.map((d) => d.wallpaperId);
  },

  subscribe: (authorId) => {
    if (get().isSubscribed(authorId)) return;
    const newSub: Subscription = {
      id: "s_" + Date.now(),
      authorId,
      subscribedAt: new Date().toISOString(),
    };
    set((state) => {
      const subscriptions = [...state.subscriptions, newSub];
      setStorage("subscriptions", subscriptions);
      return { subscriptions };
    });
  },

  unsubscribe: (authorId) => {
    set((state) => {
      const subscriptions = state.subscriptions.filter((s) => s.authorId !== authorId);
      setStorage("subscriptions", subscriptions);
      return { subscriptions };
    });
  },

  isSubscribed: (authorId) => {
    return get().subscriptions.some((s) => s.authorId === authorId);
  },

  followTag: (tagId, tagName) => {
    if (get().isTagFollowed(tagId)) return;
    const newTag: FollowedTag = {
      id: "ft_" + Date.now(),
      tagId,
      tagName,
      followedAt: new Date().toISOString(),
    };
    set((state) => {
      const followedTags = [...state.followedTags, newTag];
      setStorage("followedTags", followedTags);
      return { followedTags };
    });
  },

  unfollowTag: (tagId) => {
    set((state) => {
      const followedTags = state.followedTags.filter((t) => t.tagId !== tagId);
      setStorage("followedTags", followedTags);
      return { followedTags };
    });
  },

  isTagFollowed: (tagId) => {
    return get().followedTags.some((t) => t.tagId === tagId);
  },

  submitFeedback: (data) => {
    const newFeedback: Feedback = {
      id: "fb_" + Date.now(),
      status: "pending",
      createdAt: new Date().toISOString(),
      ...data,
    };
    set((state) => {
      const feedback = [newFeedback, ...state.feedback];
      setStorage("feedback", feedback);
      return { feedback };
    });
  },

  addNotification: (notification) => {
    const newNotification: NotificationMessage = {
      ...notification,
      id: "n_" + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const notifications = [newNotification, ...state.notifications];
      setStorage("notifications", notifications);
      return { notifications };
    });
  },

  markNotificationRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      setStorage("notifications", notifications);
      return { notifications };
    });
  },

  markAllNotificationsRead: () => {
    set((state) => {
      const notifications = state.notifications.map((n) => ({ ...n, read: true }));
      setStorage("notifications", notifications);
      return { notifications };
    });
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  getNotificationsByAuthor: (authorId) => {
    return get().notifications.filter((n) => n.authorId === authorId);
  },
}));
