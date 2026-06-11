import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  TrendingUp,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  ArrowRight,
  Mountain,
  Building2,
  Shapes,
  Cat,
  Rocket,
  Square,
  Gamepad2,
  Cpu,
  Layers,
  UtensilsCrossed,
  Car,
} from "lucide-react";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { hotTags } from "@/data/tags";
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

export default function Home() {
  const navigate = useNavigate();
  const { featuredWallpapers, hotWallpapers, newWallpapers, searchWallpapers, setFilters } =
    useWallpaperStore();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredWallpapers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredWallpapers.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchWallpapers(searchQuery);
      setFilters({ query: searchQuery });
      navigate(buildSearchQuery({ q: searchQuery }));
      showToast({ type: "info", message: `正在搜索: ${searchQuery}` });
    }
  };

  const handleTagClick = (tagName: string) => {
    setFilters({ tags: [tagName] });
    navigate(buildSearchQuery({ tag: tagName }));
    showToast({ type: "info", message: `筛选标签: ${tagName}` });
  };

  const handleCategoryClick = (categoryId: string) => {
    setFilters({ categoryId });
    navigate(buildSearchQuery({ category: categoryId }));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredWallpapers.length) % featuredWallpapers.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredWallpapers.length);
  };

  const topThree = hotWallpapers.slice(0, 3);
  const restHot = hotWallpapers.slice(3, 10);

  return (
    <div className="min-h-screen">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>精选百万高清壁纸，每日更新</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
              发现你的
              <span className="text-gradient"> 专属壁纸</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              海量 4K/8K 超清壁纸，涵盖风景、动漫、游戏、极简等多种风格
            </p>

            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索壁纸、标签、风格..."
                className="input pl-14 pr-32 py-4 text-lg rounded-2xl"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-3"
              >
                搜索
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-gray-500 mr-2">热门搜索:</span>
              {hotTags.slice(0, 6).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.name)}
                  className="tag"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">
              <Sparkles className="w-6 h-6 text-primary" />
              精选推荐
            </h2>
            <Link to="/search" className="btn-ghost flex items-center gap-2 text-sm">
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative rounded-3xl overflow-hidden group">
            <div className="relative aspect-[21/9] overflow-hidden">
              {featuredWallpapers.map((wallpaper, index) => (
                <div
                  key={wallpaper.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={wallpaper.imageUrl}
                    alt={wallpaper.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-medium">
                          编辑精选 #{index + 1}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-300">
                          <Heart className="w-3 h-3 text-red-400" />
                          {formatNumber(wallpaper.favorites)}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-4xl font-bold font-display text-white mb-3">
                        {wallpaper.title}
                      </h3>
                      <p className="text-gray-300 mb-4 line-clamp-2">{wallpaper.description}</p>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/wallpaper/${wallpaper.id}`}
                          className="btn-primary"
                        >
                          查看详情
                        </Link>
                        <span className="text-sm text-gray-400">
                          {formatNumber(wallpaper.views)} 次浏览 · {formatNumber(wallpaper.downloads)} 次下载
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 backdrop-blur-lg text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 backdrop-blur-lg text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {featuredWallpapers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "w-8 bg-primary"
                      : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">
              <Flame className="w-6 h-6 text-red-500" />
              热门排行榜 Top 10
            </h2>
            <Link to="/search" className="btn-ghost flex items-center gap-2 text-sm">
              完整榜单
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {topThree.map((wallpaper, index) => {
              const IconComponent = iconMap[categories.find((c) => c.id === wallpaper.categoryId)?.icon || "Mountain"];
              const rankColors = [
                "from-yellow-400 to-amber-500",
                "from-gray-300 to-gray-400",
                "from-amber-600 to-amber-700",
              ];
              const rankBadges = ["🥇", "🥈", "🥉"];

              return (
                <Link
                  key={wallpaper.id}
                  to={`/wallpaper/${wallpaper.id}`}
                  className="group relative block rounded-2xl overflow-hidden bg-surface border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={wallpaper.thumbnailUrl}
                      alt={wallpaper.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div
                      className={`absolute top-4 left-4 flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${rankColors[index]} text-white font-bold text-xl font-display shadow-lg`}
                    >
                      {rankBadges[index]}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                        {wallpaper.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          {formatNumber(wallpaper.downloads)} 下载
                        </span>
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="space-y-2">
            {restHot.map((wallpaper, index) => {
              const rank = index + 4;
              return (
                <Link
                  key={wallpaper.id}
                  to={`/wallpaper/${wallpaper.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl bg-surface/50 border border-border hover:bg-surface hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-light font-bold text-lg font-display text-gray-400 group-hover:text-primary transition-colors">
                    {rank}
                  </div>
                  <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={wallpaper.thumbnailUrl}
                      alt={wallpaper.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-100 line-clamp-1 group-hover:text-primary transition-colors">
                      {wallpaper.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatNumber(wallpaper.views)} 浏览</span>
                      <span>{formatNumber(wallpaper.downloads)} 下载</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-primary">
                      +{Math.floor(Math.random() * 500 + 100)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">
              <Clock className="w-6 h-6 text-primary" />
              最新壁纸
            </h2>
            <Link to="/search" className="btn-ghost flex items-center gap-2 text-sm">
              更多
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <WallpaperGrid wallpapers={newWallpapers.slice(0, 8)} columns={4} />
        </div>
      </section>

      <section className="py-12 pb-20">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">
              <Sparkles className="w-6 h-6 text-accent" />
              编辑精选合辑
            </h2>
            <Link to="/categories" className="btn-ghost flex items-center gap-2 text-sm">
              全部分类
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => {
              const IconComponent = iconMap[category.icon] || Mountain;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group relative p-6 rounded-2xl border border-border overflow-hidden text-left hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
                  style={{
                    background: `linear-gradient(135deg, ${category.color}15 0%, transparent 60%)`,
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: category.color }}
                  />
                  <div
                    className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${category.color}25` }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: category.color }}
                    />
                  </div>
                  <h3 className="relative font-semibold text-gray-100 mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="relative text-sm text-gray-400">
                    {formatNumber(category.wallpaperCount)} 张壁纸
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
