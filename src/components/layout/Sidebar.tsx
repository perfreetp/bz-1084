import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Search,
  Heart,
  Download,
  Settings,
  MessageSquare,
  Flame,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useUISTore } from "@/store/useUISTore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useUserStore } from "@/store/useUserStore";

const navItems = [
  { path: "/", icon: Home, label: "首页推荐" },
  { path: "/categories", icon: LayoutGrid, label: "分类浏览" },
  { path: "/search", icon: Search, label: "搜索筛选" },
  { path: "/favorites", icon: Heart, label: "收藏夹" },
  { path: "/downloads", icon: Download, label: "下载记录" },
  { path: "/feedback", icon: MessageSquare, label: "举报反馈" },
  { path: "/settings", icon: Settings, label: "个人设置" },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUISTore();
  const { user } = useUserStore();
  const { favorites, downloads } = useFavoriteStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen glass border-r border-border flex flex-col transition-all duration-300 z-40 ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Flame className="w-5 h-5 text-background" />
            </div>
            <span className="font-display font-bold text-lg text-gradient">
              WallpaperHub
            </span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Flame className="w-5 h-5 text-background" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="btn-icon ml-auto"
          title={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
        >
          {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {!sidebarCollapsed && (
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
            />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "nav-item-active" : ""} ${
                    sidebarCollapsed ? "justify-center px-2" : ""
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.path === "/favorites" && favorites.length > 0 && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {favorites.length}
                      </span>
                    )}
                    {item.path === "/downloads" && downloads.length > 0 && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        {downloads.length}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {!sidebarCollapsed && (
        <div className="px-4 py-4 border-t border-border">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-xs text-gray-400 mb-2">升级会员</p>
            <p className="text-sm font-semibold text-white mb-2">解锁 4K+ 超清壁纸</p>
            <button className="w-full btn-primary text-sm py-2">立即升级</button>
          </div>
        </div>
      )}
    </aside>
  );
}
