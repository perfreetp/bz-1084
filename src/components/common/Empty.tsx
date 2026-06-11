import { Inbox } from "lucide-react";

interface EmptyProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function Empty({
  title = "暂无数据",
  description = "这里还没有任何内容",
  icon,
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4 border border-border">
        {icon || <Inbox className="w-10 h-10 text-gray-500" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}
