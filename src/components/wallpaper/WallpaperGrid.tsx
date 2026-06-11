import type { Wallpaper } from "@/types";
import { WallpaperCard } from "./WallpaperCard";
import { Empty } from "@/components/common/Empty";

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  showRank?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  columns?: 2 | 3 | 4 | 5;
}

export function WallpaperGrid({
  wallpapers,
  showRank,
  selectable,
  selectedIds = [],
  onSelect,
  columns = 4,
}: WallpaperGridProps) {
  if (wallpapers.length === 0) {
    return <Empty title="没有找到壁纸" description="尝试调整筛选条件或搜索关键词" />;
  }

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  }[columns];

  return (
    <div className={`grid gap-5 ${gridCols}`}>
      {wallpapers.map((wallpaper, index) => (
        <div key={wallpaper.id} className="animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
          <WallpaperCard
            wallpaper={wallpaper}
            showRank={showRank ? index + 1 : undefined}
            selectable={selectable}
            selected={selectedIds.includes(wallpaper.id)}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
