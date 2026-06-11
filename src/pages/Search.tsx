import { useState, useEffect, useMemo } from "react";
import { Search, X, TrendingUp, Clock, SlidersHorizontal, ChevronDown } from "lucide-react";
import { FilterPanel } from "@/components/filter/FilterPanel";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { hotTags } from "@/data/tags";
import { getStorage, setStorage } from "@/utils/storage";
import type { AspectRatio, FilterOptions } from "@/types";

const SEARCH_HISTORY_KEY = "searchHistory";
const MAX_HISTORY = 10;

const sortOptions: { value: FilterOptions["sort"]; label: string }[] = [
  { value: "popular", label: "最受欢迎" },
  { value: "newest", label: "最新上传" },
  { value: "downloads", label: "下载最多" },
  { value: "views", label: "浏览最多" },
];

export default function SearchPage() {
  const { filterWallpapers, wallpapers } = useWallpaperStore();

  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sort, setSort] = useState<FilterOptions["sort"]>("popular");
  const [aspectRatios, setAspectRatios] = useState<AspectRatio[]>([]);
  const [resolutions, setResolutions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const history = getStorage<string[]>(SEARCH_HISTORY_KEY, []);
    setSearchHistory(history);
  }, []);

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
    setQuery(searchKeyword);
    setInputValue(searchKeyword);
    if (searchKeyword.trim()) {
      addToHistory(searchKeyword.trim());
    }
    setShowHistory(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    setAspectRatios([]);
    setResolutions([]);
    setTags([]);
  };

  const handleTagClick = (tagName: string) => {
    if (tags.includes(tagName)) {
      setTags(tags.filter((t) => t !== tagName));
    } else {
      setTags([...tags, tagName]);
    }
  };

  const filteredWallpapers = useMemo(() => {
    return filterWallpapers({
      query,
      sort,
      aspectRatios,
      resolutions,
      tags,
    });
  }, [query, sort, aspectRatios, resolutions, tags, filterWallpapers]);

  const hasActiveFilters = query || aspectRatios.length > 0 || resolutions.length > 0 || tags.length > 0;

  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label || "最受欢迎";

  return (
    <div className="space-y-6">
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
                  setQuery("");
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
                  <button onClick={clearHistory} className="text-xs text-gray-500 hover:text-primary transition-colors">
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
                    onClick={() => {
                      setSort(option.value);
                      setShowSortDropdown(false);
                    }}
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

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            <span className="text-xs text-gray-400">已选筛选：</span>
            {query && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                "{query}"
                <button onClick={() => { setQuery(""); setInputValue(""); }} className="hover:text-primary-light">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {aspectRatios.map((ratio) => (
              <span key={ratio} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {ratio}
                <button onClick={() => setAspectRatios(aspectRatios.filter((r) => r !== ratio))} className="hover:text-primary-light">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {resolutions.map((res) => (
              <span key={res} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {res}
                <button onClick={() => setResolutions(resolutions.filter((r) => r !== res))} className="hover:text-primary-light">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                #{tag}
                <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-primary-light">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setQuery("");
                setInputValue("");
                handleReset();
              }}
              className="ml-auto text-xs text-gray-400 hover:text-primary transition-colors"
            >
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
            onAspectRatioChange={setAspectRatios}
            onResolutionChange={setResolutions}
            onTagChange={setTags}
            onReset={handleReset}
          />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              共找到 <span className="text-primary font-medium">{filteredWallpapers.length}</span> 张壁纸
            </p>
          </div>
          <WallpaperGrid wallpapers={filteredWallpapers} columns={4} />
        </main>
      </div>
    </div>
  );
}
