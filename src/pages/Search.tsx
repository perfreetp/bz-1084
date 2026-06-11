import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  X,
  TrendingUp,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
import { FilterPanel } from "@/components/filter/FilterPanel";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { hotTags, allTags } from "@/data/tags";
import { categories } from "@/data/categories";
import { authors } from "@/data/authors";
import { getStorage, setStorage } from "@/utils/storage";
import { Empty } from "@/components/common/Empty";
import type { AspectRatio, FilterOptions } from "@/types";

const SEARCH_HISTORY_KEY = "searchHistory";
const MAX_HISTORY = 10;

const sortOptions: { value: FilterOptions["sort"]; label: string }[] = [
  { value: "popular", label: "最受欢迎" },
  { value: "newest", label: "最新上传" },
  { value: "downloads", label: "下载最多" },
  { value: "views", label: "浏览最多" },
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

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterWallpapers, wallpapers } = useWallpaperStore();

  const queryFromUrl = searchParams.get("q") || "";
  const tagsFromUrl = searchParams.getAll("tag");
  const categoryFromUrl = searchParams.get("category") || "";
  const authorFromUrl = searchParams.get("author") || "";
  const ratiosFromUrl = searchParams.getAll("ratio") as AspectRatio[];
  const resolutionsFromUrl = searchParams.getAll("res");
  const colorsFromUrl = searchParams.getAll("color");
  const sortFromUrl = (searchParams.get("sort") as FilterOptions["sort"]) || "popular";

  const [inputValue, setInputValue] = useState(queryFromUrl);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const query = queryFromUrl;
  const tags = tagsFromUrl;
  const categoryId = categoryFromUrl;
  const authorId = authorFromUrl;
  const aspectRatios = ratiosFromUrl;
  const resolutions = resolutionsFromUrl;
  const colors = colorsFromUrl;
  const sort = sortFromUrl;

  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    const history = getStorage<string[]>(SEARCH_HISTORY_KEY, []);
    setSearchHistory(history);
  }, []);

  const updateFilters = (updates: Record<string, string | string[] | undefined | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      newParams.delete(key);
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v) newParams.append(key, v);
          });
        } else {
          newParams.set(key, value);
        }
      }
    });
    setSearchParams(newParams);
  };

  const addToHistory = (keyword: string) => {
    if (!keyword.trim()) return;
    const newHistory = [keyword, ...searchHistory.filter((h) => h !== keyword)].slice(0, MAX_HISTORY);
    setSearchHistory(newHistory);
    setStorage(SEARCH_HISTORY_KEY, newHistory);
  };

  const removeFromHistory = (keyword: string) => {
    const newHistory = searchHistory.filter((h) => h !== keyword);
    setSearchHistory(newHistory);
    setStorage(SEARCH_HISTORY_KEY, newHistory);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setStorage(SEARCH_HISTORY_KEY, []);
  };

  const handleSearch = (keyword?: string) => {
    const searchKeyword = keyword !== undefined ? keyword : inputValue;
    if (searchKeyword.trim()) {
      addToHistory(searchKeyword.trim());
    }
    updateFilters({ q: searchKeyword.trim() || null });
    setShowHistory(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    navigate("/search");
  };

  const handleTagClick = (tagName: string) => {
    const newTags = tags.includes(tagName) ? tags.filter((t) => t !== tagName) : [...tags, tagName];
    updateFilters({ tag: newTags });
  };

  const handleRatioChange = (ratios: AspectRatio[]) => {
    updateFilters({ ratio: ratios });
  };

  const handleResolutionChange = (res: string[]) => {
    updateFilters({ res: res });
  };

  const handleColorChange = (cols: string[]) => {
    updateFilters({ color: cols });
  };

  const handleTagChange = (newTags: string[]) => {
    updateFilters({ tag: newTags });
  };

  const handleSortChange = (newSort: FilterOptions["sort"]) => {
    updateFilters({ sort: newSort });
    setShowSortDropdown(false);
  };

  const handleCategoryClick = (catId: string) => {
    updateFilters({ category: categoryId === catId ? null : catId });
  };

  const filteredWallpapers = useMemo(() => {
    return filterWallpapers({
      query,
      sort,
      aspectRatios,
      resolutions,
      tags,
      colors,
      categoryId: categoryId || undefined,
      authorId: authorId || undefined,
    });
  }, [query, sort, aspectRatios, resolutions, tags, colors, categoryId, authorId, filterWallpapers]);

  const hasActiveFilters =
    query ||
    categoryId ||
    authorId ||
    aspectRatios.length > 0 ||
    resolutions.length > 0 ||
    tags.length > 0 ||
    colors.length > 0;

  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label || "最受欢迎";
  const categoryName = categoryId ? categories.find((c) => c.id === categoryId)?.name : "";
  const authorName = authorId ? authors.find((a) => a.id === authorId)?.name : "";
  const colorNameMap: Record<string, string> = {
    "#ef4444": "红色", "#f97316": "橙色", "#f59e0b": "黄色", "#22c55e": "绿色",
    "#14b8a6": "青色", "#3b82f6": "蓝色", "#8b5cf6": "紫色", "#ec4899": "粉色",
    "#000000": "黑色", "#ffffff": "白色", "#1e3a8a": "深蓝", "#64748b": "灰色",
  };

  const suggestedTags = allTags.slice(0, 8);
  const suggestedCategories = categories.slice(0, 6);

  return (
    <div className="space-y-6 py-8 px-8">
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              placeholder="搜索壁纸、标签或描述..."
              className="input pl-12 pr-24"
            />
            {inputValue && (
              <button
                onClick={() => {
                  setInputValue("");
                  updateFilters({ q: null });
                }}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-light text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-background font-medium rounded-lg hover:bg-primary-light transition-colors text-sm"
            >
              搜索
            </button>

            {showHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl p-3 z-50 animate-slide-down">
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    搜索历史
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-primary transition-colors"
                  >
                    清空
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((keyword) => (
                    <div
                      key={keyword}
                      className="group flex items-center gap-1 px-3 py-1.5 bg-surface rounded-full text-sm text-gray-300 hover:bg-surface-light transition-colors cursor-pointer"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSearch(keyword)}
                    >
                      <span>{keyword}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(keyword);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-surface-hover transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="btn-secondary flex items-center gap-2 min-w-[140px]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl p-2 z-50 animate-slide-down">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      sort === option.value
                        ? "bg-primary/15 text-primary"
                        : "text-gray-300 hover:bg-surface-light"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!hasActiveFilters && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-gray-400">热门搜索</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hotTags.slice(0, 8).map((tag) => {
                const active = tags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.name)}
                    className={`tag ${active ? "tag-active" : ""}`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            <span className="text-xs text-gray-400">已选筛选：</span>
            {query && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                关键词: "{query}"
                <button
                  onClick={() => updateFilters({ q: null })}
                  className="hover:text-primary-light"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {categoryId && categoryName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                分类: {categoryName}
                <button
                  onClick={() => updateFilters({ category: null })}
                  className="hover:text-primary-light"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {authorId && authorName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                作者: {authorName}
                <button
                  onClick={() => updateFilters({ author: null })}
                  className="hover:text-primary-light"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {aspectRatios.map((ratio) => (
              <span
                key={ratio}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                比例: {ratio}
                <button
                  onClick={() => handleRatioChange(aspectRatios.filter((r) => r !== ratio))}
                  className="hover:text-primary-light"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {resolutions.map((res) => (
              <span
                key={res}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {res}
                <button
                  onClick={() => handleResolutionChange(resolutions.filter((r) => r !== res))}
                  className="hover:text-primary-light"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {colors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                <span
                  className="w-3 h-3 rounded-full ring-1 ring-white/20"
                  style={{ backgroundColor: color }}
                />
                {colorNameMap[color] || color}
                <button
                  onClick={() => handleColorChange(colors.filter((c) => c !== color))}
                  className="hover:text-primary-light"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                #{tag}
                <button
                  onClick={() => handleTagChange(tags.filter((t) => t !== tag))}
                  className="hover:text-primary-light"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={handleReset}
              className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
            >
              <Filter className="w-3 h-3" />
              清除全部
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <FilterPanel
            aspectRatios={aspectRatios}
            resolutions={resolutions}
            tags={tags}
            colors={colors}
            onAspectRatioChange={handleRatioChange}
            onResolutionChange={handleResolutionChange}
            onTagChange={handleTagChange}
            onColorChange={handleColorChange}
            onReset={handleReset}
          />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              共找到 <span className="text-primary font-medium">{filteredWallpapers.length}</span> 张壁纸
            </p>
          </div>

          {filteredWallpapers.length > 0 ? (
            <WallpaperGrid wallpapers={filteredWallpapers} columns={4} />
          ) : (
            <div className="glass rounded-2xl p-10">
              <Empty
                icon={<ImageIcon className="w-10 h-10 text-gray-500" />}
                title="没有找到匹配的壁纸"
                description="试试调整筛选条件，或者看看下面的推荐内容吧"
              />

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    推荐标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => {
                      const active = tags.includes(tag.name);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => handleTagClick(tag.name)}
                          className={`tag ${active ? "tag-active" : ""}`}
                        >
                          #{tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <Sparkles className="w-4 h-4 text-accent" />
                    热门分类
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedCategories.map((cat) => {
                      const active = categoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                            active
                              ? "bg-primary/15 border border-primary/40 text-primary"
                              : "bg-surface border border-border text-gray-300 hover:border-primary/30 hover:text-gray-100"
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center pt-4">
                  <Link to="/" className="btn-secondary flex items-center gap-2">
                    回到首页探索
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
