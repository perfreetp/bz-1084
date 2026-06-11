import { useCallback } from "react";
import { useUISTore } from "@/store/useUISTore";
import type { Toast } from "@/types";

export function useToast() {
  const { addToast, removeToast } = useUISTore();

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Date.now().toString();
      const duration = toast.duration || 3000;
      addToast({ ...toast, id });
      setTimeout(() => removeToast(id), duration);
    },
    [addToast, removeToast]
  );

  return { showToast };
}
