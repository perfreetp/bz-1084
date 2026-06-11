import { useState } from "react";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  FileText,
  AlertTriangle,
  Copyright,
  Lightbulb,
  ListTodo,
  ChevronRight,
} from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useToast } from "@/hooks/useToast";
import type { FeedbackType, FeedbackStatus } from "@/types";

type FeedbackTab = "submit" | "list";

const feedbackTypes: { value: FeedbackType; label: string; desc: string; icon: typeof AlertTriangle }[] = [
  { value: "broken_link", label: "失效链接", desc: "壁纸无法下载或图片无法显示", icon: LinkIcon },
  { value: "inappropriate", label: "不当内容", desc: "包含违规、低俗或不适宜的内容", icon: AlertTriangle },
  { value: "copyright", label: "版权问题", desc: "涉嫌侵犯您的版权或知识产权", icon: Copyright },
  { value: "suggestion", label: "功能建议", desc: "对产品功能或体验的改进建议", icon: Lightbulb },
];

const statusConfig: Record<FeedbackStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "待处理", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", icon: Clock },
  processing: { label: "处理中", color: "text-primary border-primary/30 bg-primary/10", icon: Loader2 },
  resolved: { label: "已解决", color: "text-green-400 border-green-500/30 bg-green-500/10", icon: CheckCircle2 },
  rejected: { label: "已拒绝", color: "text-red-400 border-red-500/30 bg-red-500/10", icon: XCircle },
};

export default function Feedback() {
  const [activeTab, setActiveTab] = useState<FeedbackTab>("submit");

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold font-display">举报反馈</h1>
        </div>

        <div className="glass rounded-2xl p-2 mb-6 inline-flex gap-1">
          <button
            onClick={() => setActiveTab("submit")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === "submit"
                ? "bg-primary text-background"
                : "text-gray-300 hover:text-gray-100 hover:bg-surface-light"
            }`}
          >
            <Send className="w-4 h-4" />
            提交反馈
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === "list"
                ? "bg-primary text-background"
                : "text-gray-300 hover:text-gray-100 hover:bg-surface-light"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            我的反馈
          </button>
        </div>

        {activeTab === "submit" ? <SubmitForm /> : <FeedbackList />}
      </div>
    </div>
  );
}

function SubmitForm() {
  const { submitFeedback } = useFavoriteStore();
  const { showToast } = useToast();

  const [type, setType] = useState<FeedbackType | "">("");
  const [wallpaperId, setWallpaperId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!type) {
      showToast({ type: "error", message: "请选择反馈类型" });
      return;
    }
    if (!title.trim()) {
      showToast({ type: "error", message: "请输入反馈标题" });
      return;
    }
    if (!description.trim()) {
      showToast({ type: "error", message: "请输入详细描述" });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      submitFeedback({
        type: type as FeedbackType,
        wallpaperId: wallpaperId.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
      });
      showToast({ type: "success", message: "反馈提交成功，我们会尽快处理" });
      setType("");
      setWallpaperId("");
      setTitle("");
      setDescription("");
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h2 className="section-title">提交反馈</h2>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
          <AlertCircle className="w-4 h-4 text-primary" />
          反馈类型
        </label>
        <div className="grid grid-cols-2 gap-3">
          {feedbackTypes.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                type === value
                  ? "bg-primary/10 border-primary/40"
                  : "bg-surface border-border hover:border-primary/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  type === value ? "bg-primary/20 text-primary" : "bg-surface-light text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className={`font-medium ${type === value ? "text-primary" : "text-gray-100"}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
          <LinkIcon className="w-4 h-4 text-primary" />
          关联壁纸 ID
          <span className="text-gray-500">（可选）</span>
        </label>
        <input
          type="text"
          value={wallpaperId}
          onChange={(e) => setWallpaperId(e.target.value)}
          className="input"
          placeholder="请输入壁纸 ID，例如 wp_123456"
        />
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="简要描述您的问题或建议"
          maxLength={50}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{title.length}/50</p>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          详细描述
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="input resize-none"
          placeholder="请详细描述您遇到的问题或建议，我们会认真对待每一条反馈..."
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{description.length}/500</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="btn-primary flex items-center gap-2 disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {submitting ? "提交中..." : "提交反馈"}
      </button>
    </div>
  );
}

function FeedbackList() {
  const { feedback } = useFavoriteStore();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const getTypeLabel = (type: FeedbackType) => {
    return feedbackTypes.find((t) => t.value === type)?.label || type;
  };

  if (feedback.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 animate-fade-in">
        <div className="text-center py-20">
          <ListTodo className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">暂无反馈记录</p>
          <p className="text-gray-500 text-sm mt-2">提交的反馈将在这里展示处理状态</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {feedback.map((item) => {
        const status = statusConfig[item.status];
        const StatusIcon = status.icon;
        const typeInfo = feedbackTypes.find((t) => t.value === item.type);
        const TypeIcon = typeInfo?.icon || AlertCircle;

        return (
          <div
            key={item.id}
            className="glass rounded-2xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-surface-light flex items-center justify-center shrink-0">
                <TypeIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-medium text-gray-100 truncate">{item.title}</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border bg-surface border-border text-gray-400">
                    <TypeIcon className="w-3 h-3" />
                    {getTypeLabel(item.type)}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border ${status.color}`}>
                    <StatusIcon className={`w-3 h-3 ${status.icon === Loader2 ? "animate-spin" : ""}`} />
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.createdAt)}
                  </span>
                  {item.wallpaperId && (
                    <span className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      壁纸 ID: {item.wallpaperId}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
