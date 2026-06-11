import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ToastContainer } from "@/components/common/Toast";
import { useUISTore } from "@/store/useUISTore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useUserStore } from "@/store/useUserStore";

export function Layout() {
  const { sidebarCollapsed } = useUISTore();
  const initFavorites = useFavoriteStore((s) => s.initFromStorage);
  const initUser = useUserStore((s) => s.initFromStorage);

  useEffect(() => {
    initFavorites();
    initUser();
  }, [initFavorites, initUser]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="min-h-screen animate-fade-in">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
