import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Calendar,
  Heart,
  Trash2,
  Monitor,
  Clock,
  Filter,
  X,
  AlertTriangle,
  Search,
  Droplets,
  User,
  Shield,
  ChevronDown,
  FileText,
  Info,
  RefreshCcw,
  Eye,
} from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { useToast } from "@/hooks/useToast";
import { allAuthors } from "@/data/authors";
import { Empty } from "@/components/common/Empty";
import { formatFullDate, formatNumber } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { CopyrightType } from "@/types";

type ClearRange = "week" | "month" | "all";
type ResolutionFilter = "all" | "4K UHD" | "2K QHD" | "1080P FHD" | "720P HD";
type TimeRangeFilter = "all" | "today" | "week" | "month" | "older";
type WatermarkFilter = "all" | "with" | "without";

const resolutionOptions: { key: ResolutionFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "4K UHD", label: "4K UHD" },
  { key: "2K QHD", label: "2K QHD" },
  { key: "1080P FHD", label: "1080P FHD" },
  { key: "720P HD", label: "720P HD" },
];

const timeRangeOptions: { key: TimeRangeFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "today", label: "今天" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "older", label: "更早" },
];

const watermarkOptions: { key: WatermarkFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "with", label: "含水印" },
  { key: "without", label: "无水印" },
];

const getFileSizeFromResolution = (resolution: string): string => {
  const lower = resolution.toLowerCase();
  if (lower.includes("4k") || lower.includes("uhd") || lower.includes("3840") || lower.includes("2160")) {
    return "约 8.5 MB";
  }
  if (lower.includes("2k") || lower.includes("qhd") || lower.includes("2560") || lower.includes("1440")) {
    return "约 4.2 MB";
  }
  if (lower.includes("1080") || lower.includes("fhd") || lower.includes("1920")) {
    return "约 2.1 MB";
  }
  if (lower.includes("720") || lower.includes("hd") || lower.includes("1280")) {
    return "约 0.9 MB";
  }
  return "未知";
};

const matchResolution = (downloadResolution: string, filter: ResolutionFilter): boolean => {
  if (filter === "all") return true;
  const lower = downloadResolution.toLowerCase();
  switch (filter) {
    case "4K UHD":
      return lower.includes("4k") || lower.includes("uhd") || lower.includes("3840") || lower.includes("2160");
    case "2K QHD":
      return lower.includes("2k") || lower.includes("qhd") || lower.includes("2560") || lower.includes("1440");
    case "1080P FHD":
      return lower.includes("1080") || lower.includes("fhd") || lower.includes("1920");
    case "720P HD":
      return lower.includes("720") || lower.includes("hd") || lower.includes("1280");
    default:
      return true;
  }
};

const matchTimeRange = (downloadedAt: string, filter: TimeRangeFilter): boolean => {
  if (filter === "all") return true;
  const now = new Date();
  const dlTime = new Date(downloadedAt).getTime();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  switch (filter) {
    case "today":
      return dlTime >= startOfToday;
    case "week":
      return dlTime >= now.getTime() - 7 * 24 * 60 * 60 * 1000;
    case "month":
      return dlTime >= now.getTime() - 30 * 24 * 60 * 60 * 1000;
    case "older":
      return dlTime < now.getTime() - 30 * 24 * 60 * 60 * 1000;
    default:
      return true;
  }
};

const matchWatermark = (watermark: boolean | undefined, filter: WatermarkFilter): boolean => {
  if (filter === "all") return true;
  if (filter === "with") return watermark === true;
  return watermark === false || watermark === undefined;
};

const copyrightBadgeConfig: Record<CopyrightType, { label: string; bg: string; text: string; desc: string }> = {
  free: {
    label: "免费",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    desc: "免费授权，可自由使用，无版权限制。",
  },
  cc: {
    label: "CC 协议",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    desc: "知识共享协议，使用时请遵守具体 CC 条款，通常需署名。",
  },
  commercial: {
    label: "商用",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    desc: "需获得作者或版权方授权后方可用于商业用途。",
  },
};

export default function Downloads() {
  const { downloads, favorites, clearDownloads, addDownload } = useFavoriteStore();
  const { getWallpaperById } = useWallpaperStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [resolutionFilter, setResolutionFilter] = useState<ResolutionFilter>("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>("all");
  const [watermarkFilter, setWatermarkFilter] = useState<WatermarkFilter>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearRange, setClearRange] = useState<ClearRange>("week");
  const [imgLoaded, setImgLoaded] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const uniqueAuthors = useMemo(() => {
    const map = new Map<string, string>();
    downloads.forEach((d) => {
      const aid = d.authorId || getWallpaperById(d.wallpaperId)?.authorId;
      let aname = d.authorName;
      if (!aname && aid) {
        const found = allAuthors.find((a) => a.id === aid);
        if (found) aname = found.name;
      }
      if (!aname && !aid) {
        const wp = getWallpaperById(d.wallpaperId);
        if (wp) {
          const found = allAuthors.find((a) => a.id === wp.authorId);
          if (found) {
            map.set(wp.authorId, found.name);
            return;
          }
        }
      }
      if (aid && aname) {
        map.set(aid, aname);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [downloads, getWallpaperById]);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthTime = startOfMonth.getTime();

    const thisMonthCount = downloads.filter(
      (d) => new Date(d.downloadedAt).getTime() >= startOfMonthTime
    ).length;

    return {
      total: downloads.length,
      thisMonth: thisMonthCount,
      favorites: favorites.length,
    };
  }, [downloads, favorites]);

  const filteredDownloads = useMemo(() => {
    return downloads.filter((download) => {
      const wallpaper = getWallpaperById(download.wallpaperId);
      const title = download.wallpaperTitle || wallpaper?.title || "";
      const matchesSearch = searchQuery.trim() === ""
        ? true
        : title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesResolution = matchResolution(download.resolution, resolutionFilter);
      const matchesTime = matchTimeRange(download.downloadedAt, timeRangeFilter);
      const matchesWatermark = matchWatermark(download.watermark, watermarkFilter);

      let matchesAuthor = true;
      if (authorFilter !== "all") {
        const aid = download.authorId || wallpaper?.authorId;
        matchesAuthor = aid === authorFilter;
      }

      return matchesSearch && matchesResolution && matchesTime && matchesWatermark && matchesAuthor;
    });
  }, [downloads, searchQuery, resolutionFilter, timeRangeFilter, watermarkFilter, authorFilter, getWallpaperById]);

  const groupedDownloads = useMemo(() => {
    const groups: Record<string, typeof filteredDownloads> = {};
    filteredDownloads.forEach((d) => {
      const date = new Date(d.downloadedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filteredDownloads]);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays} 天前`;

    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleClear = () => {
    let beforeDate: string | undefined;
    const now = new Date();

    switch (clearRange) {
      case "week":
        beforeDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        clearDownloads(beforeDate);
        showToast({ type: "success", message: "已清理一周前的下载记录" });
        break;
      case "month":
        beforeDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        clearDownloads(beforeDate);
        showToast({ type: "success", message: "已清理一月前的下载记录" });
        break;
      case "all":
        if (confirm("确定要清空所有下载记录吗？此操作不可恢复。")) {
          clearDownloads();
          showToast({ type: "success", message: "已清空所有下载记录" });
        } else {
          return;
        }
        break;
    }
    setShowClearModal(false);
  };

  const resolveTitle = (download: (typeof downloads)[0]) => {
    if (download.wallpaperTitle) return download.wallpaperTitle;
    const wp = getWallpaperById(download.wallpaperId);
    return wp?.title || "未知壁纸";
  };

  const resolveThumbnail = (download: (typeof downloads)[0]) => {
    if (download.wallpaperThumbnail) return download.wallpaperThumbnail;
    const wp = getWallpaperById(download.wallpaperId);
    return wp?.thumbnailUrl || "";
  };

  const resolveAuthorName = (download: (typeof downloads)[0]) => {
    if (download.authorName) return download.authorName;
    const wp = getWallpaperById(download.wallpaperId);
    if (wp) {
      const author = allAuthors.find((a) => a.id === wp.authorId);
      if (author) return author.name;
    }
    return "";
  };

  const resolveAuthorId = (download: (typeof downloads)[0]) => {
    if (download.authorId) return download.authorId;
    const wp = getWallpaperById(download.wallpaperId);
    return wp?.authorId;
  };

  const resolveCopyrightType = (download: (typeof downloads)[0]): CopyrightType | undefined => {
    if (download.copyrightType) return download.copyrightType;
    const wp = getWallpaperById(download.wallpaperId);
    return wp?.copyright?.type;
  };

  const handleRedownload = (download: (typeof downloads)[0]) => {
    const title = resolveTitle(download);
    const thumbnail = resolveThumbnail(download);
    const authorName = resolveAuthorName(download);
    const authorId = resolveAuthorId(download);
    const copyrightType = resolveCopyrightType(download);

    addDownload(
      download.wallpaperId,
      download.resolution,
      download.watermark,
      title,
      thumbnail,
      authorId,
      authorName,
      copyrightType
    );
    showToast({ type: "success", message: `「${title}」已重新加入下载队列` });
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const statCards = [
    {
      label: "总下载数",
      value: formatNumber(stats.total),
      icon: Download,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "本月下载",
      value: formatNumber(stats.thisMonth),
      icon: Calendar,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "收藏数量",
      value: formatNumber(stats.favorites),
      icon: Heart,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
  ];

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    resolutionFilter !== "all" ||
    timeRangeFilter !== "all" ||
    watermarkFilter !== "all" ||
    authorFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setResolutionFilter("all");
    setTimeRangeFilter("all");
    setWatermarkFilter("all");
    setAuthorFilter("all");
  };

  const selectedAuthorLabel = authorFilter === "all"
    ? "全部作者"
    : uniqueAuthors.find((a) => a.id === authorFilter)?.name || "未知作者";

  return (
    <div className="min-h-screen">
      <header className="px-8 py-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 font-display flex items-center gap-2">
              <Download className="w-6 h-6 text-primary" />
              下载记录
            </h1>
            <p className="text-sm text-gray-500 mt-1">查看和管理你下载过的所有壁纸</p>
          </div>

          {downloads.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-gray-200 hover:bg-surface-light hover:border-red-500/30 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">清理历史</span>
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索壁纸名称..."
              className="input pl-12 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-light text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {resolutionOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setResolutionFilter(opt.key)}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  resolutionFilter === opt.key
                    ? "bg-primary/15 border border-primary/40 text-primary"
                    : "bg-surface border border-border text-gray-300 hover:bg-surface-light hover:border-primary/30 hover:text-gray-100"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 shrink-0">时间</span>
            {timeRangeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTimeRangeFilter(opt.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  timeRangeFilter === opt.key
                    ? "bg-primary/15 border border-primary/40 text-primary"
                    : "bg-surface border border-border text-gray-400 hover:bg-surface-light hover:border-primary/30 hover:text-gray-200"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 shrink-0">水印</span>
            {watermarkOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setWatermarkFilter(opt.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  watermarkFilter === opt.key
                    ? "bg-primary/15 border border-primary/40 text-primary"
                    : "bg-surface border border-border text-gray-400 hover:bg-surface-light hover:border-primary/30 hover:text-gray-200"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAuthorDropdown(!showAuthorDropdown)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                authorFilter !== "all"
                  ? "bg-primary/15 border border-primary/40 text-primary"
                  : "bg-surface border border-border text-gray-400 hover:bg-surface-light hover:border-primary/30 hover:text-gray-200"
              )}
            >
              <User className="w-3.5 h-3.5" />
              {selectedAuthorLabel}
              <ChevronDown className={cn("w-3 h-3 transition-transform", showAuthorDropdown && "rotate-180")} />
            </button>
            {showAuthorDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAuthorDropdown(false)} />
                <div className="absolute top-full left-0 mt-1.5 w-44 py-1.5 bg-surface border border-border rounded-xl shadow-xl z-20 animate-slide-up">
                  <button
                    onClick={() => { setAuthorFilter("all"); setShowAuthorDropdown(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs hover:bg-surface-light transition-colors",
                      authorFilter === "all" ? "text-primary" : "text-gray-300"
                    )}
                  >
                    全部作者
                  </button>
                  {uniqueAuthors.map((author) => (
                    <button
                      key={author.id}
                      onClick={() => { setAuthorFilter(author.id); setShowAuthorDropdown(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs hover:bg-surface-light transition-colors",
                        authorFilter === author.id ? "text-primary" : "text-gray-300"
                      )}
                    >
                      {author.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
            <span className="text-xs text-gray-400">当前筛选：</span>
            {searchQuery.trim() !== "" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                关键词: "{searchQuery.trim()}"
                <button onClick={() => setSearchQuery("")} className="hover:text-primary-light">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {resolutionFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                分辨率: {resolutionFilter}
                <button onClick={() => setResolutionFilter("all")} className="hover:text-primary-light">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {timeRangeFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                时间: {timeRangeOptions.find((o) => o.key === timeRangeFilter)?.label}
                <button onClick={() => setTimeRangeFilter("all")} className="hover:text-primary-light">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {watermarkFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                水印: {watermarkOptions.find((o) => o.key === watermarkFilter)?.label}
                <button onClick={() => setWatermarkFilter("all")} className="hover:text-primary-light">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {authorFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                作者: {selectedAuthorLabel}
                <button onClick={() => setAuthorFilter("all")} className="hover:text-primary-light">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
            >
              <Filter className="w-3 h-3" />
              清除全部
            </button>
          </div>
        )}
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="p-5 rounded-2xl bg-surface border border-border hover:border-border-light transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", card.bgColor)}>
                  <card.icon className={cn("w-6 h-6", card.color)} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-100 font-display">{card.value}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDownloads.length > 0 ? (
          <div className="space-y-6">
            {groupedDownloads.map(([dateKey, dayDownloads]) => (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-medium text-gray-200">{formatDateLabel(dateKey)}</span>
                  </div>
                  <span className="text-sm text-gray-500">{dayDownloads.length} 项</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-2">
                  {dayDownloads.map((download) => {
                    const wallpaper = getWallpaperById(download.wallpaperId);
                    const thumbnail = resolveThumbnail(download);
                    const title = resolveTitle(download);
                    const authorName = resolveAuthorName(download);
                    const authorId = resolveAuthorId(download);
                    const copyrightType = resolveCopyrightType(download);
                    const isExpanded = expandedId === download.id;

                    return (
                      <div
                        key={download.id}
                        className={cn(
                          "rounded-xl bg-surface border transition-all overflow-hidden",
                          isExpanded
                            ? "border-primary/40"
                            : "border-border hover:border-primary/40 hover:bg-surface-light"
                        )}
                      >
                        <div
                          onClick={(e) => toggleExpand(download.id, e)}
                          className="flex items-center gap-4 p-4 cursor-pointer"
                        >
                          <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-background-light shrink-0 pointer-events-none">
                            {thumbnail && !imgLoaded[download.id] && (
                              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface to-surface-light" />
                            )}
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={title}
                                className={cn(
                                  "w-full h-full object-cover transition-all duration-300",
                                  isExpanded ? "scale-105" : "",
                                  imgLoaded[download.id] ? "opacity-100" : "opacity-0"
                                )}
                                onLoad={() =>
                                  setImgLoaded((prev) => ({ ...prev, [download.id]: true }))
                                }
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Monitor className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pointer-events-none">
                            <h3 className={cn(
                              "text-sm font-medium truncate transition-colors",
                              isExpanded ? "text-primary" : "text-gray-100"
                            )}>
                              {title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Monitor className="w-3 h-3" />
                                {download.resolution}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {formatFullDate(download.downloadedAt)}
                              </span>
                              {authorName && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <User className="w-3 h-3" />
                                  {authorName}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                {download.watermark !== undefined && (
                                  <div
                                    className={cn(
                                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                                      download.watermark
                                        ? "bg-amber-500/10 text-amber-400"
                                        : "bg-emerald-500/10 text-emerald-400"
                                    )}
                                  >
                                    <Droplets className="w-3 h-3" />
                                    {download.watermark ? "含水印" : "无水印"}
                                  </div>
                                )}
                                {copyrightType && (
                                  <div
                                    className={cn(
                                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                                      copyrightBadgeConfig[copyrightType].bg,
                                      copyrightBadgeConfig[copyrightType].text
                                    )}
                                  >
                                    <Shield className="w-3 h-3" />
                                    {copyrightBadgeConfig[copyrightType].label}
                                  </div>
                                )}
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs">
                                  <Download className="w-3 h-3" />
                                  已下载
                                </div>
                              </div>
                            </div>
                            <ChevronDown
                              className={cn(
                                "w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0",
                                isExpanded ? "rotate-180 text-primary" : ""
                              )}
                            />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0">
                            <div className="border-t border-border pt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="rounded-xl bg-background-light/50 border border-border p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-100">文件信息</h4>
                                </div>
                                <div className="space-y-2.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">本次下载分辨率</span>
                                    <span className="text-gray-200 font-medium">{download.resolution}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">预计文件大小</span>
                                    <span className="text-gray-200 font-medium">{getFileSizeFromResolution(download.resolution)}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">下载时间</span>
                                    <span className="text-gray-200 font-medium">{formatFullDate(download.downloadedAt)}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">记录 ID</span>
                                    <span className="text-gray-400 font-mono text-[11px]">{download.id}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl bg-background-light/50 border border-border p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Info className="w-4 h-4 text-purple-400" />
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-100">授权说明</h4>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="text-xs text-gray-500">版权类型</span>
                                      {copyrightType ? (
                                        <span className={cn(
                                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]",
                                          copyrightBadgeConfig[copyrightType].bg,
                                          copyrightBadgeConfig[copyrightType].text
                                        )}>
                                          {copyrightBadgeConfig[copyrightType].label}
                                        </span>
                                      ) : (
                                        <span className="text-[11px] text-gray-500">未记录</span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed pl-5.5">
                                      {copyrightType
                                        ? copyrightBadgeConfig[copyrightType].desc
                                        : "暂无版权信息，请联系作者确认使用权限。"}
                                    </p>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <Droplets className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="text-xs text-gray-500">水印状态</span>
                                      <span className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]",
                                        download.watermark
                                          ? "bg-amber-500/10 text-amber-400"
                                          : "bg-emerald-500/10 text-emerald-400"
                                      )}>
                                        {download.watermark ? "含官方水印" : "纯净无水印"}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed pl-5.5">
                                      {download.watermark
                                        ? "下载的图片包含作者或平台水印，用于标识来源，建议非商用场景使用。"
                                        : "下载的图片为纯净版本，无任何水印，适合展示和使用。"}
                                    </p>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <User className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="text-xs text-gray-500">作者署名</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed pl-5.5">
                                      {authorName
                                        ? `本作品由「${authorName}」创作，如需转载或商用，请保留作者署名并联系作者获得授权。`
                                        : "暂无作者信息，使用前请确认版权归属。"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl bg-background-light/50 border border-border p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <RefreshCcw className="w-4 h-4 text-amber-400" />
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-100">快捷操作</h4>
                                </div>
                                <div className="space-y-2">
                                  {wallpaper ? (
                                    <Link
                                      to={`/wallpaper/${wallpaper.id}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      查看壁纸
                                    </Link>
                                  ) : (
                                    <button
                                      disabled
                                      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-500 text-xs font-medium cursor-not-allowed"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      壁纸已移除
                                    </button>
                                  )}
                                  {authorId ? (
                                    <Link
                                      to={`/search?author=${authorId}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-gray-200 text-xs font-medium hover:bg-surface-light hover:border-primary/30 hover:text-primary transition-colors"
                                    >
                                      <User className="w-3.5 h-3.5" />
                                      查看作者作品
                                    </Link>
                                  ) : (
                                    <button
                                      disabled
                                      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-500 text-xs font-medium cursor-not-allowed"
                                    >
                                      <User className="w-3.5 h-3.5" />
                                      作者信息缺失
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRedownload(download);
                                    }}
                                    className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    再次下载
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12">
            <Empty
              icon={<Download className="w-10 h-10 text-gray-500" />}
              title={hasActiveFilters ? "没有找到匹配的下载记录" : "暂无下载记录"}
              description={hasActiveFilters ? "试试调整搜索和筛选条件" : "去发现页面下载喜欢的壁纸吧"}
            />
          </div>
        )}
      </div>

      {showClearModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100">清理下载记录</h3>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-2 rounded-lg hover:bg-surface-light text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-5">
              选择要清理的时间范围，清理后的记录将无法恢复。
            </p>

            <div className="space-y-2">
              {([
                { key: "week" as ClearRange, label: "清理一周前的记录", desc: "保留最近 7 天" },
                { key: "month" as ClearRange, label: "清理一月前的记录", desc: "保留最近 30 天" },
                { key: "all" as ClearRange, label: "清空所有记录", desc: "全部删除，不可恢复" },
              ]).map((opt) => (
                <div
                  key={opt.key}
                  onClick={() => setClearRange(opt.key)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all",
                    clearRange === opt.key
                      ? "bg-primary/15 border border-primary/30"
                      : "bg-surface-light border border-transparent hover:bg-surface"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      clearRange === opt.key
                        ? "border-primary"
                        : "border-gray-500"
                    )}
                  >
                    {clearRange === opt.key && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        clearRange === opt.key ? "text-primary" : "text-gray-200"
                      )}
                    >
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                  </div>
                  {opt.key === "all" && (
                    <Trash2 className="w-4 h-4 text-red-400" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-5 py-2.5 rounded-xl bg-surface border border-border text-gray-200 hover:bg-surface-light transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClear}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                确认清理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
