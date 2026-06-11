export type AspectRatio = "16:9" | "21:9" | "9:16" | "4:3" | "1:1";
export type CopyrightType = "free" | "cc" | "commercial";
export type FeedbackType = "broken_link" | "inappropriate" | "copyright" | "suggestion";
export type FeedbackStatus = "pending" | "processing" | "resolved" | "rejected";
export type ScheduleInterval = "hourly" | "daily" | "weekly" | "custom";
export type ScheduleSourceType = "favorites" | "subscription" | "tag" | "all";
export type DeviceType = "desktop" | "tablet" | "mobile";

export interface Resolution {
  name: string;
  width: number;
  height: number;
  url: string;
  size: string;
}

export interface Copyright {
  type: CopyrightType;
  license: string;
  attribution?: string;
  watermark: boolean;
}

export interface Wallpaper {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  resolutions: Resolution[];
  aspectRatio: AspectRatio;
  colors: string[];
  tags: string[];
  categoryId: string;
  authorId: string;
  views: number;
  downloads: number;
  favorites: number;
  uploadedAt: string;
  copyright: Copyright;
}

export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  wallpaperCount: number;
  followerCount: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId?: string;
  wallpaperCount: number;
}

export interface Tag {
  id: string;
  name: string;
  wallpaperCount: number;
}

export interface FavoriteGroup {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  wallpaperId: string;
  groupId: string;
  addedAt: string;
}

export interface Download {
  id: string;
  wallpaperId: string;
  resolution: string;
  downloadedAt: string;
  filePath?: string;
  watermark?: boolean;
  wallpaperTitle?: string;
  wallpaperThumbnail?: string;
  authorId?: string;
  authorName?: string;
  copyrightType?: CopyrightType;
}

export interface Subscription {
  id: string;
  authorId: string;
  subscribedAt: string;
}

export interface FollowedTag {
  id: string;
  tagId: string;
  tagName: string;
  followedAt: string;
}

export interface Feedback {
  id: string;
  type: FeedbackType;
  wallpaperId?: string;
  title: string;
  description: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface Schedule {
  enabled: boolean;
  interval: ScheduleInterval;
  customHours?: number;
  sourceType: ScheduleSourceType;
  sourceId?: string;
  lastChanged?: string;
}

export interface UserSettings {
  darkPreview: boolean;
  autoDownload: boolean;
  defaultResolution: string;
  notifications: {
    subscriptionUpdate: boolean;
    favoriteReminder: boolean;
    weeklyDigest: boolean;
    systemNotice: boolean;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  schedule: Schedule;
  settings: UserSettings;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface FilterOptions {
  query?: string;
  categoryId?: string;
  authorId?: string;
  resolutions?: string[];
  aspectRatios?: AspectRatio[];
  colors?: string[];
  tags?: string[];
  sort?: "popular" | "newest" | "downloads" | "views";
}

export type NotificationType = "subscription_update" | "favorite_update" | "system" | "weekly_digest";

export interface NotificationMessage {
  id: string;
  type: NotificationType;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  wallpaperId?: string;
  wallpaperTitle?: string;
  wallpaperThumbnail?: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}
