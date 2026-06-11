import { useState, useMemo } from "react";
import {
  FolderPlus,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
  Folder,
  X,
  Check,
  MoveRight,
  Heart,
  ChevronRight,
} from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { useToast } from "@/hooks/useToast";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { Empty } from "@/components/common/Empty";
import { cn } from "@/lib/utils";
import type { FavoriteGroup } from "@/types";

export default function Favorites() {
  const {
    groups,
    favorites,
    createGroup,
    deleteGroup,
    updateGroup,
    batchMoveFavorites,
    batchRemoveFavorites,
    getFavoritesByGroup,
  } = useFavoriteStore();
  const { getWallpaperById } = useWallpaperStore();
  const { showToast } = useToast();

  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || "default");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState<string[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FavoriteGroup | null>(null);
  const [groupFormName, setGroupFormName] = useState("");
  const [groupFormDesc, setGroupFormDesc] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetGroupId, setMoveTargetGroupId] = useState("");

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    favorites.forEach((f) => {
      counts[f.groupId] = (counts[f.groupId] || 0) + 1;
    });
    return counts;
  }, [favorites]);

  const currentGroupFavorites = useMemo(() => {
    return getFavoritesByGroup(selectedGroupId);
  }, [selectedGroupId, getFavoritesByGroup]);

  const currentGroupWallpapers = useMemo(() => {
    return currentGroupFavorites
      .map((f) => getWallpaperById(f.wallpaperId))
      .filter((w) => w !== undefined);
  }, [currentGroupFavorites, getWallpaperById]);

  const selectedWallpaperIds = useMemo(() => {
    return selectedFavoriteIds
      .map((fid) => {
        const fav = favorites.find((f) => f.id === fid);
        return fav?.wallpaperId;
      })
      .filter((id): id is string => id !== undefined);
  }, [selectedFavoriteIds, favorites]);

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupFormName("");
    setGroupFormDesc("");
    setShowGroupModal(true);
  };

  const handleEditGroup = (group: FavoriteGroup) => {
    setEditingGroup(group);
    setGroupFormName(group.name);
    setGroupFormDesc(group.description || "");
    setShowGroupModal(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (groupId === "default") {
      showToast({ type: "error", message: "默认分组不能删除" });
      return;
    }
    if (confirm("确定要删除此分组吗？分组内的收藏也会被移除。")) {
      deleteGroup(groupId);
      if (selectedGroupId === groupId) {
        setSelectedGroupId("default");
      }
      showToast({ type: "success", message: "分组已删除" });
    }
  };

  const handleSubmitGroup = () => {
    if (!groupFormName.trim()) {
      showToast({ type: "error", message: "请输入分组名称" });
      return;
    }
    if (editingGroup) {
      updateGroup(editingGroup.id, { name: groupFormName, description: groupFormDesc });
      showToast({ type: "success", message: "分组已更新" });
    } else {
      createGroup(groupFormName, groupFormDesc);
      showToast({ type: "success", message: "分组已创建" });
    }
    setShowGroupModal(false);
  };

  const toggleSelectFavorite = (wallpaperId: string) => {
    const fav = currentGroupFavorites.find((f) => f.wallpaperId === wallpaperId);
    if (!fav) return;
    setSelectedFavoriteIds((prev) =>
      prev.includes(fav.id) ? prev.filter((id) => id !== fav.id) : [...prev, fav.id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFavoriteIds.length === currentGroupFavorites.length) {
      setSelectedFavoriteIds([]);
    } else {
      setSelectedFavoriteIds(currentGroupFavorites.map((f) => f.id));
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedFavoriteIds([]);
  };

  const handleBatchMove = () => {
    if (selectedFavoriteIds.length === 0) {
      showToast({ type: "warning", message: "请先选择要移动的壁纸" });
      return;
    }
    setMoveTargetGroupId(groups.find((g) => g.id !== selectedGroupId)?.id || "");
    setShowMoveModal(true);
  };

  const confirmBatchMove = () => {
    if (!moveTargetGroupId) {
      showToast({ type: "error", message: "请选择目标分组" });
      return;
    }
    batchMoveFavorites(selectedFavoriteIds, moveTargetGroupId);
    showToast({ type: "success", message: `已移动 ${selectedFavoriteIds.length} 张壁纸` });
    setShowMoveModal(false);
    setSelectedFavoriteIds([]);
    setSelectMode(false);
  };

  const handleBatchDelete = () => {
    if (selectedFavoriteIds.length === 0) {
      showToast({ type: "warning", message: "请先选择要删除的壁纸" });
      return;
    }
    if (confirm(`确定要从收藏中移除选中的 ${selectedFavoriteIds.length} 张壁纸吗？`)) {
      batchRemoveFavorites(selectedFavoriteIds);
      showToast({ type: "success", message: "已移除选中的壁纸" });
      setSelectedFavoriteIds([]);
      setSelectMode(false);
    }
  };

  return (
    <div className="h-screen flex">
      <aside className="w-64 shrink-0 border-r border-border bg-surface/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Folder className="w-5 h-5 text-primary" />
              我的分组
            </h2>
            <button
              onClick={handleCreateGroup}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="新建分组"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-1",
                selectedGroupId === group.id
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-gray-300 hover:bg-surface hover:text-gray-100"
              )}
              onClick={() => setSelectedGroupId(group.id)}
            >
              <Folder
                className={cn(
                  "w-4 h-4 shrink-0",
                  selectedGroupId === group.id ? "text-primary" : "text-gray-500"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{group.name}</div>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full shrink-0",
                  selectedGroupId === group.id
                    ? "bg-primary/20 text-primary"
                    : "bg-background text-gray-400"
                )}
              >
                {groupCounts[group.id] || 0}
              </span>
              <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditGroup(group);
                  }}
                  className="p-1 rounded hover:bg-black/20 text-gray-400 hover:text-gray-200 transition-colors"
                  title="编辑"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {group.id !== "default" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group.id);
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 font-display flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              收藏夹
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {groups.find((g) => g.id === selectedGroupId)?.name || "默认收藏"} ·{" "}
              {currentGroupFavorites.length} 张壁纸
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectMode ? (
              <>
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-gray-200 hover:bg-surface-light transition-colors"
                >
                  {selectedFavoriteIds.length === currentGroupFavorites.length ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {selectedFavoriteIds.length === currentGroupFavorites.length ? "取消全选" : "全选"}
                  </span>
                </button>
                <button
                  onClick={handleBatchMove}
                  disabled={selectedFavoriteIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MoveRight className="w-4 h-4" />
                  <span className="text-sm">移动 ({selectedFavoriteIds.length})</span>
                </button>
                <button
                  onClick={handleBatchDelete}
                  disabled={selectedFavoriteIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">删除</span>
                </button>
                <button
                  onClick={exitSelectMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-gray-200 hover:bg-surface-light transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">取消</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setSelectMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-gray-200 hover:bg-surface-light transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                <span className="text-sm">批量管理</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {currentGroupWallpapers.length > 0 ? (
            <WallpaperGrid
              wallpapers={currentGroupWallpapers}
              selectable={selectMode}
              selectedIds={selectedWallpaperIds}
              onSelect={toggleSelectFavorite}
              columns={4}
            />
          ) : (
            <Empty
              icon={<Heart className="w-10 h-10 text-gray-500" />}
              title="该分组暂无收藏"
              description="去发现页面浏览壁纸，点击❤️即可收藏到这里"
            />
          )}
        </div>
      </main>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-100">
                {editingGroup ? "编辑分组" : "新建分组"}
              </h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-2 rounded-lg hover:bg-surface-light text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">分组名称</label>
                <input
                  type="text"
                  value={groupFormName}
                  onChange={(e) => setGroupFormName(e.target.value)}
                  placeholder="请输入分组名称"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">描述（可选）</label>
                <textarea
                  value={groupFormDesc}
                  onChange={(e) => setGroupFormDesc(e.target.value)}
                  placeholder="简单描述一下这个分组..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-5 py-2.5 rounded-xl bg-surface border border-border text-gray-200 hover:bg-surface-light transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitGroup}
                className="px-5 py-2.5 rounded-xl bg-primary text-background hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingGroup ? "保存" : "创建"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-100">移动到分组</h3>
              <button
                onClick={() => setShowMoveModal(false)}
                className="p-2 rounded-lg hover:bg-surface-light text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {groups
                .filter((g) => g.id !== selectedGroupId)
                .map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setMoveTargetGroupId(group.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all",
                      moveTargetGroupId === group.id
                        ? "bg-primary/15 border border-primary/30 text-primary"
                        : "bg-surface-light border border-transparent text-gray-200 hover:bg-surface"
                    )}
                  >
                    <Folder
                      className={cn(
                        "w-4 h-4 shrink-0",
                        moveTargetGroupId === group.id ? "text-primary" : "text-gray-500"
                      )}
                    />
                    <span className="text-sm flex-1">{group.name}</span>
                    <span className="text-xs text-gray-500">{groupCounts[group.id] || 0} 张</span>
                    {moveTargetGroupId === group.id && <Check className="w-4 h-4" />}
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-5 py-2.5 rounded-xl bg-surface border border-border text-gray-200 hover:bg-surface-light transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmBatchMove}
                disabled={!moveTargetGroupId}
                className="px-5 py-2.5 rounded-xl bg-primary text-background hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MoveRight className="w-4 h-4" />
                确认移动
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
