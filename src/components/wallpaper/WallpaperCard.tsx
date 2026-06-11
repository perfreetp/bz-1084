import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Download, Eye, MoreHorizontal, Check } from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useToast } from "@/hooks/useToast";
import type { Wallpaper } from "@/types";
import { formatNumber, formatDate } from "@/utils/format";

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  showRank?: number;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export function WallpaperCard({
  wallpaper,
  showRank,
  selectable,
  selected,
  onSelect,
}: WallpaperCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { isWallpaperFavorited, addToFavorites, removeWallpaperFromAll } = useFavoriteStore();
  const { showToast } = useToast();
  const favorited = isWallpaperFavorited(wallpaper.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      removeWallpaperFromAll(wallpaper.id);
      showToast({ type: "info", message: "已取消收藏" });
    } else {
      addToFavorites(wallpaper.id);
      showToast({ type: "success", message: "已添加到收藏夹" });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showToast({ type: "info", message: "请前往详情页选择分辨率下载" });
  };

  return (
    <Link
      to={`/wallpaper/${wallpaper.id}`}
      className="group relative block rounded-2xl overflow-hidden bg-surface border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden bg-background-light">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface to-surface-light" />
        )}
        <img
          src={wallpaper.thumbnailUrl}
          alt={wallpaper.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? "scale-105" : "scale-100"
          } ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {showRank !== undefined && (
          <div className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/90 text-background font-bold text-sm font-display shadow-lg">
            {showRank}
          </div>
        )}

        {selectable && (
          <div
            className={`absolute top-3 left-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              selected ? "bg-primary border-primary text-background" : "border-white/50 bg-black/30"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onSelect?.(wallpaper.id);
            }}
          >
            {selected && <Check className="w-4 h-4" />}
          </div>
        )}

        <div
          className={`absolute top-3 right-3 flex items-center gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full backdrop-blur-lg transition-all ${
              favorited
                ? "bg-red-500/90 text-white"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
            title={favorited ? "取消收藏" : "收藏"}
          >
            <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-black/40 backdrop-blur-lg text-white hover:bg-black/60 transition-all"
            title="下载"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.preventDefault()}
            className="p-2 rounded-full bg-black/40 backdrop-blur-lg text-white hover:bg-black/60 transition-all"
            title="更多"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h3 className="text-white font-medium text-sm line-clamp-1 mb-1">
            {wallpaper.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(wallpaper.views)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {formatNumber(wallpaper.downloads)}
            </span>
            <span>{formatDate(wallpaper.uploadedAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 p-3 pt-2">
        {wallpaper.colors.slice(0, 3).map((color, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full ring-1 ring-white/10"
            style={{ backgroundColor: color }}
          />
        ))}
        <div className="flex-1" />
        {wallpaper.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-xs text-gray-400">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
