import { Monitor, Smartphone, Tablet, MonitorPlay } from "lucide-react";
import type { AspectRatio } from "@/types";
import { hotTags } from "@/data/tags";

interface FilterPanelProps {
  aspectRatios: AspectRatio[];
  resolutions: string[];
  tags: string[];
  onAspectRatioChange: (ratios: AspectRatio[]) => void;
  onResolutionChange: (resolutions: string[]) => void;
  onTagChange: (tags: string[]) => void;
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
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#000000", "#ffffff",
];

export function FilterPanel({
  aspectRatios,
  resolutions,
  tags,
  onAspectRatioChange,
  onResolutionChange,
  onTagChange,
  onReset,
}: FilterPanelProps) {
  const toggleItem = <T,>(list: T[], item: T, setter: (list: T[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const hasFilters = aspectRatios.length > 0 || resolutions.length > 0 || tags.length > 0;

  return (
    <div className="glass rounded-2xl p-5 space-y-6 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-100">筛选条件</h3>
        {hasFilters && (
          <button onClick={onReset} className="text-xs text-primary hover:text-primary-light transition-colors">
            重置
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
        <h4 className="text-sm font-medium text-gray-300 mb-3">主色调</h4>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              className="w-7 h-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-110"
              style={{
                backgroundColor: color,
                ["--tw-ring-color" as any]: color,
                border: color === "#ffffff" ? "1px solid #374151" : "none",
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">热门标签</h4>
        <div className="flex flex-wrap gap-2">
          {hotTags.slice(0, 10).map((tag) => {
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
