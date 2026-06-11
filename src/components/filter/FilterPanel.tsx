import { Monitor, Smartphone, Tablet, MonitorPlay, Check } from "lucide-react";
import type { AspectRatio } from "@/types";
import { hotTags } from "@/data/tags";

interface FilterPanelProps {
  aspectRatios: AspectRatio[];
  resolutions: string[];
  tags: string[];
  colors: string[];
  onAspectRatioChange: (ratios: AspectRatio[]) => void;
  onResolutionChange: (resolutions: string[]) => void;
  onTagChange: (tags: string[]) => void;
  onColorChange: (colors: string[]) => void;
  onReset: () => void;
}

const aspectRatioOptions: { value: AspectRatio; label: string; icon: typeof Monitor }[] = [
  { value: "16:9", label: "16:9 桌面", icon: Monitor },
  { value: "21:9", label: "21:9 超宽", icon: MonitorPlay },
  { value: "9:16", label: "9:16 手机", icon: Smartphone },
  { value: "4:3", label: "4:3 平板", icon: Tablet },
];

const resolutionOptions = ["4K UHD", "2K QHD", "1080P FHD", "720P HD"];

const colorOptions = [
  { name: "红色", value: "#ef4444" },
  { name: "橙色", value: "#f97316" },
  { name: "黄色", value: "#f59e0b" },
  { name: "绿色", value: "#22c55e" },
  { name: "青色", value: "#14b8a6" },
  { name: "蓝色", value: "#3b82f6" },
  { name: "紫色", value: "#8b5cf6" },
  { name: "粉色", value: "#ec4899" },
  { name: "黑色", value: "#000000" },
  { name: "白色", value: "#ffffff" },
  { name: "深蓝", value: "#1e3a8a" },
  { name: "灰色", value: "#64748b" },
];

export function FilterPanel({
  aspectRatios,
  resolutions,
  tags,
  colors,
  onAspectRatioChange,
  onResolutionChange,
  onTagChange,
  onColorChange,
  onReset,
}: FilterPanelProps) {
  const toggleItem = <T,>(list: T[], item: T, setter: (list: T[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const hasFilters =
    aspectRatios.length > 0 || resolutions.length > 0 || tags.length > 0 || colors.length > 0;

  return (
    <div className="glass rounded-2xl p-5 space-y-6 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-100">筛选条件</h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-xs text-primary hover:text-primary-light transition-colors"
          >
            重置全部
          </button>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">设备比例</h4>
        <div className="grid grid-cols-2 gap-2">
          {aspectRatioOptions.map((opt) => {
            const active = aspectRatios.includes(opt.value);
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => toggleItem(aspectRatios, opt.value, onAspectRatioChange)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-primary/15 border border-primary/40 text-primary"
                    : "bg-surface border border-border text-gray-400 hover:text-gray-200 hover:border-border-light"
                }`}
              >
                <Icon className="w-4 h-4" />
                {opt.label.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">分辨率</h4>
        <div className="flex flex-wrap gap-2">
          {resolutionOptions.map((res) => {
            const active = resolutions.includes(res);
            return (
              <button
                key={res}
                onClick={() => toggleItem(resolutions, res, onResolutionChange)}
                className={`tag ${active ? "tag-active" : ""}`}
              >
                {res}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          主色调
          {colors.length > 0 && (
            <span className="ml-2 text-xs text-primary">已选 {colors.length}</span>
          )}
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {colorOptions.map((color) => {
            const active = colors.includes(color.value);
            return (
              <button
                key={color.value}
                onClick={() => toggleItem(colors, color.value, onColorChange)}
                title={color.name}
                className={`relative w-8 h-8 rounded-full transition-all hover:scale-110 ${
                  active ? "ring-2 ring-offset-2 ring-offset-background" : "ring-1 ring-border"
                }`}
                style={{
                  backgroundColor: color.value,
                  ["--tw-ring-color" as any]: active ? "#22d3ee" : undefined,
                  border: color.value === "#ffffff" ? "1px solid #374151" : "none",
                }}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className={`w-4 h-4 ${
                        color.value === "#ffffff" || color.value === "#f59e0b" ? "text-background" : "text-white"
                      }`}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">热门标签</h4>
        <div className="flex flex-wrap gap-2">
          {hotTags.slice(0, 12).map((tag) => {
            const active = tags.includes(tag.name);
            return (
              <button
                key={tag.id}
                onClick={() => toggleItem(tags, tag.name, onTagChange)}
                className={`tag ${active ? "tag-active" : ""}`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
