import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { DeviceType } from "@/types";

interface DevicePreviewProps {
  imageUrl: string;
  device: DeviceType;
  darkMode: boolean;
}

const deviceStyles: Record<DeviceType, { wrapper: string; screen: string; icon: typeof Monitor; label: string }> = {
  desktop: {
    wrapper: "w-full max-w-3xl mx-auto",
    screen: "aspect-video rounded-lg",
    icon: Monitor,
    label: "桌面端",
  },
  tablet: {
    wrapper: "w-full max-w-sm mx-auto",
    screen: "aspect-[4/3] rounded-xl",
    icon: Tablet,
    label: "平板端",
  },
  mobile: {
    wrapper: "w-full max-w-xs mx-auto",
    screen: "aspect-[9/16] rounded-3xl",
    icon: Smartphone,
    label: "移动端",
  },
};

export function DevicePreview({ imageUrl, device, darkMode }: DevicePreviewProps) {
  const style = deviceStyles[device];
  const Icon = style.icon;

  return (
    <div className={style.wrapper}>
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface text-sm text-gray-300">
          <Icon className="w-4 h-4" />
          {style.label}预览
        </span>
      </div>
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          darkMode ? "bg-background border-border" : "bg-gray-100 border-gray-200"
        }`}
      >
        <div
          className={`${style.screen} overflow-hidden shadow-2xl ${
            darkMode ? "ring-1 ring-white/10" : "ring-1 ring-black/10"
          }`}
        >
          <img src={imageUrl} alt="预览" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
