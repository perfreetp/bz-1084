import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useUISTore } from "@/store/useUISTore";
import type { Toast } from "@/types";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "text-green-400 border-green-500/30 bg-green-500/10",
  error: "text-red-400 border-red-500/30 bg-red-500/10",
  info: "text-primary border-primary/30 bg-primary/10",
  warning: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
};

function ToastItem({ toast }: { toast: Toast }) {
  const Icon = icons[toast.type];
  const { removeToast } = useUISTore();

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl ${colors[toast.type]} animate-slide-down min-w-80 max-w-md`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useUISTore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
}
