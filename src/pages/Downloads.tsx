import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Calendar,
  Heart,
  Trash2,
  ChevronRight,
  Monitor,
  Clock,
  Filter,
  X,
  AlertTriangle,
  Search,
  Hash,
  Droplets,
} from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { useToast } from "@/hooks/useToast";
import { Empty } from "@/components/common/Empty";
import { formatFullDate, formatNumber } from "@/utils/format";
import { cn } from "@/lib/utils";

type ClearRange = "week" | "month" | "all";
type ResolutionFilter = "all" | "4K UHD" | "2K QHD" | "1080P FHD" | "720P HD";

const resolutionOptions: { key: ResolutionFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "4K UHD", label: "4K UHD" },
  { key: "2K QHD", label: "2K QHD" },
  { key: "1080P FHD", label: "1080P FHD" },
  { key: "720P HD", label: "720P HD" },
];

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

export default function Downloads() {
  const { downloads, favorites, clearDownloads } = useFavoriteStore();
  const { getWallpaperById } = useWallpaperStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [resolutionFilter, setResolutionFilter] = useState<ResolutionFilter>("all");
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearRange, setClearRange] = useState<ClearRange>("week");
  const [imgLoaded, setImgLoaded] = useState<Record<string, boolean>>({});

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
      const title = wallpaper?.title || "";
      const matchesSearch = searchQuery.trim() === "" 
        ? true 
        : title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesResolution = matchResolution(download.resolution, resolutionFilter);
      return matchesSearch && matchesResolution;
    });
  }, [downloads, searchQuery, resolutionFilter, getWallpaperById]);

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

  const hasActiveFilters = searchQuery.trim() !== "" || resolutionFilter !== "all";

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
              <Filter className="w-4 h-4" />
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

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
            <span className="text-xs text-gray-400">当前筛选：</span>
            {searchQuery.trim() !== "" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                关键词: "{searchQuery.trim()}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-primary-light"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {resolutionFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                分辨率: {resolutionFilter}
                <button
                  onClick={() => setResolutionFilter("all")}
                  className="hover:text-primary-light"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setResolutionFilter("all");
              }}
              className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
            >
              <Filter className="w-3 h-3" />
              清除筛选
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
                    if (!wallpaper) return null;

                    const shortId = download.id.length > 8 
                      ? download.id.slice(0, 4) + "..." + download.id.slice(-4)
                      : download.id;

                    return (
                      <Link
                        key={download.id}
                        to={`/wallpaper/${wallpaper.id}`}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-surface-light transition-all"
                      >
                        <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-background-light shrink-0">
                          {!imgLoaded[download.id] && (
                            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface to-surface-light" />
                          )}
                          <img
                            src={wallpaper.thumbnailUrl}
                            alt={wallpaper.title}
                            className={cn(
                              "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                              imgLoaded[download.id] ? "opacity-100" : "opacity-0"
                            )}
                            onLoad={() =>
                              setImgLoaded((prev) => ({ ...prev, [download.id]: true }))
                            }
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-100 truncate group-hover:text-primary transition-colors">
                            {wallpaper.title}
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
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Hash className="w-3 h-3" />
                              {shortId}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-2">
                            {download.watermark !== undefined && (
                              <div
                                className={cn(
                                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs",
                                  download.watermark
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-emerald-500/10 text-emerald-400"
                                )}
                              >
                                <Droplets className="w-3 h-3" />
                                {download.watermark ? "含水印" : "无水印"}
                              </div>
                            )}
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                              <Download className="w-3 h-3" />
                              已下载
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
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
