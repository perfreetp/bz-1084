import { create } from "zustand";
import { getStorage, setStorage } from "@/utils/storage";
import type {
  FavoriteGroup,
  Favorite,
  Download,
  Subscription,
  FollowedTag,
  Feedback,
} from "@/types";

interface FavoriteState {
  groups: FavoriteGroup[];
  favorites: Favorite[];
  downloads: Download[];
  subscriptions: Subscription[];
  followedTags: FollowedTag[];
  feedback: Feedback[];

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

  addDownload: (wallpaperId: string, resolution: string) => void;
  clearDownloads: (beforeDate?: string) => void;
  getDownloadedWallpaperIds: () => string[];

  subscribe: (authorId: string) => void;
  unsubscribe: (authorId: string) => void;
  isSubscribed: (authorId: string) => boolean;

  followTag: (tagId: string, tagName: string) => void;
  unfollowTag: (tagId: string) => void;
  isTagFollowed: (tagId: string) => boolean;

  submitFeedback: (data: Omit<Feedback, "id" | "status" | "createdAt">) => void;
}

const defaultGroups: FavoriteGroup[] = [
  { id: "default", name: "默认收藏", description: "系统默认收藏夹", createdAt: new Date().toISOString() },
  { id: "fav_nature", name: "自然风光", description: "喜欢的自然风景壁纸", createdAt: new Date().toISOString() },
  { id: "fav_anime", name: "动漫收藏", description: "动漫插画类壁纸", createdAt: new Date().toISOString() },
];

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  groups: defaultGroups,
  favorites: [],
  downloads: [],
  subscriptions: [],
  followedTags: [],
  feedback: [],

  initFromStorage: () => {
    const groups = getStorage<FavoriteGroup[]>("groups", defaultGroups);
    const favorites = getStorage<Favorite[]>("favorites", []);
    const downloads = getStorage<Download[]>("downloads", []);
    const subscriptions = getStorage<Subscription[]>("subscriptions", []);
    const followedTags = getStorage<FollowedTag[]>("followedTags", []);
    const feedback = getStorage<Feedback[]>("feedback", []);
    set({ groups, favorites, downloads, subscriptions, followedTags, feedback });
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

  addDownload: (wallpaperId, resolution) => {
    const newDownload: Download = {
      id: "d_" + Date.now(),
      wallpaperId,
      resolution,
      downloadedAt: new Date().toISOString(),
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
}));
