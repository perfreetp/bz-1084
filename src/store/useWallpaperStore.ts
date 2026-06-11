import { create } from "zustand";
import { allWallpapers, featuredWallpapers, hotWallpapers, newWallpapers } from "@/data/wallpapers";
import type { Wallpaper, FilterOptions, AspectRatio } from "@/types";

interface WallpaperState {
  wallpapers: Wallpaper[];
  featuredWallpapers: Wallpaper[];
  hotWallpapers: Wallpaper[];
  newWallpapers: Wallpaper[];
  searchResults: Wallpaper[];
  filters: FilterOptions;
  currentWallpaper: Wallpaper | null;
  getWallpaperById: (id: string) => Wallpaper | undefined;
  getWallpapersByCategory: (categoryId: string) => Wallpaper[];
  searchWallpapers: (query: string) => Wallpaper[];
  filterWallpapers: (options: FilterOptions) => Wallpaper[];
  getSimilarWallpapers: (wallpaperId: string, limit?: number) => Wallpaper[];
  setFilters: (filters: Partial<FilterOptions>) => void;
  setCurrentWallpaper: (wallpaper: Wallpaper | null) => void;
}

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  wallpapers: allWallpapers,
  featuredWallpapers,
  hotWallpapers,
  newWallpapers,
  searchResults: [],
  filters: {},
  currentWallpaper: null,

  getWallpaperById: (id) => {
    return get().wallpapers.find((w) => w.id === id);
  },

  getWallpapersByCategory: (categoryId) => {
    return get().wallpapers.filter((w) => w.categoryId === categoryId);
  },

  searchWallpapers: (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return [];
    }
    const lowerQuery = query.toLowerCase();
    const results = get().wallpapers.filter(
      (w) =>
        w.title.toLowerCase().includes(lowerQuery) ||
        w.description.toLowerCase().includes(lowerQuery) ||
        w.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
    set({ searchResults: results });
    return results;
  },

  filterWallpapers: (options) => {
    let result = [...get().wallpapers];

    if (options.query) {
      const lowerQuery = options.query.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(lowerQuery) ||
          w.description.toLowerCase().includes(lowerQuery) ||
          w.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    }

    if (options.categoryId) {
      result = result.filter((w) => w.categoryId === options.categoryId);
    }

    if (options.authorId) {
      result = result.filter((w) => w.authorId === options.authorId);
    }

    if (options.aspectRatios && options.aspectRatios.length > 0) {
      result = result.filter((w) => (options.aspectRatios as AspectRatio[]).includes(w.aspectRatio));
    }

    if (options.tags && options.tags.length > 0) {
      result = result.filter((w) => w.tags.some((t) => options.tags!.includes(t)));
    }

    if (options.colors && options.colors.length > 0) {
      result = result.filter((w) => w.colors.some((c) => options.colors!.includes(c)));
    }

    if (options.resolutions && options.resolutions.length > 0) {
      result = result.filter((w) =>
        w.resolutions.some((r) => options.resolutions!.includes(r.name))
      );
    }

    if (options.sort) {
      switch (options.sort) {
        case "popular":
          result.sort((a, b) => b.favorites - a.favorites);
          break;
        case "newest":
          result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
          break;
        case "downloads":
          result.sort((a, b) => b.downloads - a.downloads);
          break;
        case "views":
          result.sort((a, b) => b.views - a.views);
          break;
      }
    }

    return result;
  },

  getSimilarWallpapers: (wallpaperId, limit = 8) => {
    const wallpaper = get().getWallpaperById(wallpaperId);
    if (!wallpaper) return [];

    return get()
      .wallpapers.filter((w) => w.id !== wallpaperId)
      .map((w) => {
        let score = 0;
        if (w.categoryId === wallpaper.categoryId) score += 3;
        const commonTags = w.tags.filter((t) => wallpaper.tags.includes(t));
        score += commonTags.length * 2;
        const commonColors = w.colors.filter((c) => wallpaper.colors.includes(c));
        score += commonColors.length;
        return { wallpaper: w, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.wallpaper);
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  setCurrentWallpaper: (wallpaper) => {
    set({ currentWallpaper: wallpaper });
  },
}));
