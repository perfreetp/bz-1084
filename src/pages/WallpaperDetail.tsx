import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  Download,
  Share2,
  UserPlus,
  UserCheck,
  Sun,
  Moon,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Clock,
  FileText,
  AlertCircle,
  ChevronDown,
  ArrowLeft,
  Copyright,
} from "lucide-react";
import { DevicePreview } from "@/components/wallpaper/DevicePreview";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/hooks/useToast";
import { allAuthors } from "@/data/authors";
import { formatNumber, formatDate, formatFullDate, formatFileSize } from "@/utils/format";
import type { DeviceType, Resolution } from "@/types";

const deviceTabs: { value: DeviceType; icon: typeof Monitor; label: string }[] = [
  { value: "desktop", icon: Monitor, label: "桌面" },
  { value: "tablet", icon: Tablet, label: "平板" },
  { value: "mobile", icon: Smartphone, label: "手机" },
];

function buildSearchQuery(params: Record<string, string | string[] | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true)) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else {
        searchParams.set(key, value);
      }
    }
  });
  const query = searchParams.toString();
  return query ? `/search?${query}` : "/search";
}

export default function WallpaperDetail() {
  const { id } = useParams<{ id: string }>();
  const { getWallpaperById, getSimilarWallpapers } = useWallpaperStore();
  const { isWallpaperFavorited, addToFavorites, removeWallpaperFromAll, subscribe, unsubscribe, isSubscribed, addDownload } = useFavoriteStore();
  const { user, updateSettings } = useUserStore();
  const { showToast } = useToast();

  const wallpaper = id ? getWallpaperById(id) : undefined;
  const author = wallpaper ? allAuthors.find((a) => a.id === wallpaper.authorId) : undefined;
  const similarWallpapers = id ? getSimilarWallpapers(id, 8) : [];

  const [device, setDevice] = useState<DeviceType>("desktop");
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null);

  const darkPreview = user.settings.darkPreview;

  useEffect(() => {
    if (wallpaper) {
      const defaultRes = wallpaper.resolutions.find((r) => r.name === user.settings.defaultResolution);
      setSelectedResolution(defaultRes || wallpaper.resolutions[0] || null);
    }
  }, [wallpaper, user.settings.defaultResolution]);

  const favorited = wallpaper ? isWallpaperFavorited(wallpaper.id) : false;
  const subscribed = author ? isSubscribed(author.id) : false;

  const toggleFavorite = () => {
    if (!wallpaper) return;
    if (favorited) {
      removeWallpaperFromAll(wallpaper.id);
      showToast({ type: "info", message: "已取消收藏" });
    } else {
      addToFavorites(wallpaper.id);
      showToast({ type: "success", message: "已添加到收藏夹" });
    }
  };

  const toggleSubscribe = () => {
    if (!author) return;
    if (subscribed) {
      unsubscribe(author.id);
      showToast({ type: "info", message: `已取消订阅 ${author.name}` });
    } else {
      subscribe(author.id);
      showToast({ type: "success", message: `已订阅 ${author.name}` });
    }
  };

  const handleShare = () => {
    if (!wallpaper) return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: wallpaper.title,
        text: wallpaper.description,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast({ type: "success", message: "链接已复制到剪贴板" });
    }
  };

  const handleDownload = (resolution: Resolution) => {
    if (!wallpaper) return;
    setSelectedResolution(resolution);
    addDownload(
      wallpaper.id,
      resolution.name,
      wallpaper.copyright.watermark,
      wallpaper.title,
      wallpaper.thumbnailUrl,
      wallpaper.authorId,
      author?.name,
      wallpaper.copyright.type
    );
    showToast({ type: "success", message: `开始下载 ${resolution.name} 版本` });
    setShowDownloadDropdown(false);
  };

  const toggleDarkPreview = () => {
    updateSettings({ darkPreview: !darkPreview });
  };

  const copyrightLabel = useMemo(() => {
    if (!wallpaper) return "";
    switch (wallpaper.copyright.type) {
      case "free":
        return "免费商用";
      case "cc":
        return "知识共享";
      case "commercial":
        return "商业授权";
      default:
        return "";
    }
  }, [wallpaper]);

  if (!wallpaper || !author) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-gray-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-100 mb-2">壁纸不存在</h2>
        <p className="text-gray-400 mb-6">该壁纸可能已被删除或链接无效</p>
        <Link to="/" className="btn-primary">
          返回首页
        </Link>
      </div>
    );
  }

  const primaryResolution = wallpaper.resolutions[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="btn-ghost flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
      </div>

      <div className="glass rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-1 bg-surface rounded-full p-1">
            {deviceTabs.map((tab) => {
              const Icon = tab.icon;
              const active = device === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setDevice(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-background"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={toggleDarkPreview}
            className="btn-secondary flex items-center gap-2"
          >
            {darkPreview ? (
              <>
                <Sun className="w-4 h-4" />
                亮色预览
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                暗色预览
              </>
            )}
          </button>
        </div>

        <DevicePreview
          imageUrl={wallpaper.imageUrl}
          device={device}
          darkMode={darkPreview}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-100 mb-2 font-display">
                {wallpaper.title}
              </h1>
              <p className="text-gray-400">{wallpaper.description}</p>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {formatNumber(wallpaper.views)} 浏览
              </span>
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                {formatNumber(wallpaper.downloads)} 下载
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                {formatNumber(wallpaper.favorites)} 收藏
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatDate(wallpaper.uploadedAt)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {wallpaper.tags.map((tag) => (
                <Link
                  key={tag}
                  to={buildSearchQuery({ tag })}
                  className="tag"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">主色调：</span>
              <div className="flex items-center gap-2">
                {wallpaper.colors.map((color, i) => (
                  <Link
                    key={i}
                    to={buildSearchQuery({ color })}
                    className="w-6 h-6 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-110 cursor-pointer block"
                    style={{ backgroundColor: color, ["--tw-ring-color" as any]: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="section-title">版权信息</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-surface rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Copyright className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-100">{copyrightLabel}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      {wallpaper.copyright.license}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {wallpaper.copyright.attribution || "无需特别说明"}
                  </p>
                </div>
              </div>

              {wallpaper.copyright.watermark && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-500 mb-1">下载提示</p>
                    <p className="text-sm text-gray-400">
                      该壁纸下载时将包含水印，如需无水印版本请联系作者获取授权。
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="p-3 bg-surface rounded-xl">
                  <p className="text-gray-500 mb-1">分辨率</p>
                  <p className="text-gray-200 font-medium">
                    {primaryResolution.width} × {primaryResolution.height}
                  </p>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <p className="text-gray-500 mb-1">文件大小</p>
                  <p className="text-gray-200 font-medium">{formatFileSize(primaryResolution.size)}</p>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <p className="text-gray-500 mb-1">比例</p>
                  <p className="text-gray-200 font-medium">{wallpaper.aspectRatio}</p>
                </div>
                <div className="p-3 bg-surface rounded-xl">
                  <p className="text-gray-500 mb-1">上传时间</p>
                  <p className="text-gray-200 font-medium text-xs">
                    {formatFullDate(wallpaper.uploadedAt).split(" ")[0]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {similarWallpapers.length > 0 && (
            <div>
              <h3 className="section-title">相似推荐</h3>
              <WallpaperGrid wallpapers={similarWallpapers} columns={4} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-gray-100">作者</h3>
            <div className="flex items-center gap-4">
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-100 truncate">{author.name}</p>
                <p className="text-sm text-gray-400 truncate">{author.bio}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-sm">
              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xl font-bold text-primary font-display">{author.wallpaperCount}</p>
                <p className="text-gray-400 text-xs">作品</p>
              </div>
              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xl font-bold text-accent font-display">
                  {formatNumber(author.followerCount)}
                </p>
                <p className="text-gray-400 text-xs">粉丝</p>
              </div>
            </div>
            <button
              onClick={toggleSubscribe}
              className={`w-full py-2.5 rounded-xl font-medium transition-all ${
                subscribed
                  ? "bg-surface text-gray-300 border border-border hover:bg-surface-light"
                  : "bg-primary text-background hover:bg-primary-light"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {subscribed ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    已订阅
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    订阅作者
                  </>
                )}
              </span>
            </button>
          </div>

          <div className="glass rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-gray-100">操作</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={toggleFavorite}
                className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  favorited
                    ? "bg-red-500/15 border border-red-500/30 text-red-400"
                    : "bg-surface text-gray-300 border border-border hover:bg-surface-light"
                }`}
              >
                <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
                {favorited ? "已收藏" : "收藏"}
              </button>

              <button
                onClick={handleShare}
                className="py-3 rounded-xl font-medium bg-surface text-gray-300 border border-border hover:bg-surface-light transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                分享
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                下载壁纸
                <ChevronDown className={`w-4 h-4 transition-transform ${showDownloadDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDownloadDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl p-2 z-50 animate-slide-down">
                  {wallpaper.resolutions.map((res) => (
                    <button
                      key={res.name}
                      onClick={() => handleDownload(res)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left hover:bg-surface-light transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-100">{res.name}</p>
                        <p className="text-xs text-gray-400">
                          {res.width} × {res.height}
                        </p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatFileSize(res.size)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedResolution && (
              <div className="p-3 bg-surface rounded-xl text-xs text-gray-400">
                <p>当前选择：<span className="text-gray-200">{selectedResolution.name}</span></p>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-400 space-y-1">
                <p className="font-medium text-gray-300">下载须知</p>
                <p>• 壁纸仅供个人使用，请勿二次分发</p>
                <p>• 商用请遵守对应授权协议</p>
                <p>• {wallpaper.copyright.watermark ? "下载版本包含水印" : "下载版本无水印"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
