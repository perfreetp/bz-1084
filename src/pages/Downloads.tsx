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
} from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { useToast } from "@/hooks/useToast";
import { Empty } from "@/components/common/Empty";
import { formatFullDate, formatNumber } from "@/utils/format";
import { cn } from "@/lib/utils";

type ClearRange = "week" | "month" | "all";

export default function Downloads() {
  const { downloads, favorites, clearDownloads } = useFavoriteStore();
  const { getWallpaperById } = useWallpaperStore();
  const { showToast } = useToast();

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

  const groupedDownloads = useMemo(() => {
    const groups: Record<string, typeof downloads> = {};
    downloads.forEach((d) => {
      const date = new Date(d.downloadedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [downloads]);

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

        {downloads.length > 0 ? (
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

                    return (
                      <Link
                        key={download.id}
                        to={`/wallpaper/${wallpaper.id}`}
                        className="group flex items-center gap-4 p-3 rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-surface-light transition-all"
                      >
                        <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-background-light shrink-0">
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
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Monitor className="w-3 h-3" />
                              {download.resolution}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatFullDate(download.downloadedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                            <Download className="w-3 h-3" />
                            已下载
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
              title="暂无下载记录"
              description="去发现页面下载喜欢的壁纸吧"
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
