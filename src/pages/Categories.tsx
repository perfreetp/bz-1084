import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mountain,
  Building2,
  Shapes,
  Cat,
  Rocket,
  Sparkles,
  Square,
  Gamepad2,
  Cpu,
  Layers,
  UtensilsCrossed,
  Car,
  ArrowLeft,
  Grid3X3,
  Image,
  ArrowRight,
} from "lucide-react";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { categories } from "@/data/categories";
import { useToast } from "@/hooks/useToast";
import { formatNumber } from "@/utils/format";

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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mountain,
  Building2,
  Shapes,
  Cat,
  Rocket,
  Sparkles,
  Square,
  Gamepad2,
  Cpu,
  Layers,
  UtensilsCrossed,
  Car,
};

export default function Categories() {
  const navigate = useNavigate();
  const { getWallpapersByCategory, setFilters } = useWallpaperStore();
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);
  const categoryWallpapers = selectedCategory ? getWallpapersByCategory(selectedCategory) : [];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    showToast({
      type: "info",
      message: `已选择分类: ${categories.find((c) => c.id === categoryId)?.name}`,
    });
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const handleExploreAll = () => {
    if (selectedCategory) {
      setFilters({ categoryId: selectedCategory });
      navigate(buildSearchQuery({ category: selectedCategory }));
    }
  };

  const handleViewWallpaper = (wallpaperId: string) => {
    navigate(`/wallpaper/${wallpaperId}`);
  };

  if (selectedCategory && selectedCategoryData) {
    const IconComponent = iconMap[selectedCategoryData.icon] || Mountain;

    return (
      <div className="min-h-screen py-8">
        <div className="container">
          <button
            onClick={handleBack}
            className="btn-ghost flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回全部分类
          </button>

          <div
            className="relative rounded-3xl overflow-hidden p-8 md:p-12 mb-8"
            style={{
              background: `linear-gradient(135deg, ${selectedCategoryData.color}30 0%, ${selectedCategoryData.color}05 100%)`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: selectedCategoryData.color }}
            />
            <div className="relative flex items-center gap-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${selectedCategoryData.color}40` }}
              >
                <IconComponent
                  className="w-10 h-10"
                  style={{ color: selectedCategoryData.color }}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
                  {selectedCategoryData.name}
                </h1>
                <p className="text-gray-400 mb-4">
                  共收录 {formatNumber(selectedCategoryData.wallpaperCount)} 张精选壁纸
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={handleExploreAll} className="btn-primary flex items-center gap-2">
                    浏览全部
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <Image className="w-4 h-4" />
                    当前展示 {categoryWallpapers.length} 张
                  </span>
                </div>
              </div>
            </div>
          </div>

          {categoryWallpapers.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title mb-0">
                  <Grid3X3 className="w-6 h-6 text-primary" />
                  该分类壁纸
                </h2>
                <span className="text-sm text-gray-400">
                  共 {categoryWallpapers.length} 张
                </span>
              </div>
              <WallpaperGrid
                wallpapers={categoryWallpapers}
                columns={4}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface flex items-center justify-center">
                <Image className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">暂无壁纸</h3>
              <p className="text-gray-400 mb-6">该分类下暂时没有壁纸，敬请期待</p>
              <button onClick={handleBack} className="btn-secondary">
                返回全部分类
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalWallpapers = categories.reduce((sum, c) => sum + c.wallpaperCount, 0);

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold font-display mb-3">
            浏览<span className="text-gradient">全部分类</span>
          </h1>
          <p className="text-gray-400 text-lg">
            共 {categories.length} 个分类，{formatNumber(totalWallpapers)} 张精选壁纸等你发现
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon] || Mountain;
            const wallpapers = getWallpapersByCategory(category.id);

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="group relative rounded-2xl overflow-hidden text-left border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 animate-slide-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div
                  className="relative h-48 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${category.color}40 0%, ${category.color}10 100%)`,
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"
                    style={{ backgroundColor: category.color }}
                  />

                  {wallpapers.length > 0 ? (
                    <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-3">
                      {wallpapers.slice(0, 4).map((wallpaper) => (
                        <div key={wallpaper.id} className="relative overflow-hidden rounded-lg">
                          <img
                            src={wallpaper.thumbnailUrl}
                            alt={wallpaper.title}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                          />
                        </div>
                      ))}
                      {wallpapers.length < 4 && (
                        <>
                          {Array.from({ length: 4 - wallpapers.length }).map((_, i) => (
                            <div
                              key={`empty-${i}`}
                              className="rounded-lg"
                              style={{ backgroundColor: `${category.color}20` }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconComponent
                        className="w-20 h-20 opacity-30"
                        style={{ color: category.color }}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                        style={{ backgroundColor: `${category.color}CC` }}
                      >
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-300 flex items-center gap-1">
                          <Image className="w-3.5 h-3.5" />
                          {formatNumber(category.wallpaperCount)} 张壁纸
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface/80 border-t border-border flex items-center justify-between group-hover:bg-surface transition-colors">
                  <span className="text-sm text-gray-400">
                    {wallpapers.length > 0 ? `已收录 ${wallpapers.length} 张示例` : "即将上线"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
