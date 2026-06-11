import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Palette,
  UserPlus,
  Tags,
  Bell,
  Camera,
  Mail,
  FileText,
  Lock,
  Save,
  Power,
  Clock,
  Image as ImageIcon,
  Search,
  Plus,
  X,
  Heart,
  Download,
  Sparkles,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronDown,
  Hash,
  Eye,
  Layers,
  Users,
  BellRing,
  CheckCheck,
  Circle,
  Inbox,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { useToast } from "@/hooks/useToast";
import { authors } from "@/data/authors";
import { allTags } from "@/data/tags";
import { formatDate } from "@/utils/format";
import type { ScheduleInterval, ScheduleSourceType, NotificationMessage } from "@/types";

type SettingsTab = "profile" | "schedule" | "subscription" | "tags" | "notifications";

const navItems: { key: SettingsTab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "账号资料", icon: User },
  { key: "schedule", label: "换图计划", icon: Palette },
  { key: "subscription", label: "来源订阅", icon: UserPlus },
  { key: "tags", label: "标签关注", icon: Tags },
  { key: "notifications", label: "消息提醒", icon: Bell },
];

export default function Settings() {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const { user, updateProfile, updateSchedule, updateNotifications } = useUserStore();
  const { subscriptions, followedTags, subscribe, unsubscribe, followTag, unfollowTag, isSubscribed, isTagFollowed, notifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useFavoriteStore();
  const { showToast } = useToast();

  const activeTab: SettingsTab = (tab as SettingsTab) || "profile";

  const handleTabChange = (newTab: SettingsTab) => {
    navigate(`/settings/${newTab}`);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold font-display">个人设置</h1>
        </div>

        <div className="flex gap-8">
          <aside className="w-56 shrink-0">
            <nav className="glass rounded-2xl p-3 space-y-1">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`nav-item w-full text-left ${activeTab === key ? "nav-item-active" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{label}</span>
                  {activeTab === key && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {activeTab === "profile" && (
              <ProfileSection
                user={user}
                updateProfile={updateProfile}
                showToast={showToast}
              />
            )}
            {activeTab === "schedule" && (
              <ScheduleSection
                schedule={user.schedule}
                updateSchedule={updateSchedule}
                showToast={showToast}
              />
            )}
            {activeTab === "subscription" && (
              <SubscriptionSection
                subscriptions={subscriptions}
                subscribe={subscribe}
                unsubscribe={unsubscribe}
                isSubscribed={isSubscribed}
                showToast={showToast}
                navigate={navigate}
                notificationsEnabled={user.settings.notifications.subscriptionUpdate}
              />
            )}
            {activeTab === "tags" && (
              <TagsSection
                followedTags={followedTags}
                followTag={followTag}
                unfollowTag={unfollowTag}
                isTagFollowed={isTagFollowed}
                showToast={showToast}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationsSection
                notifications={notifications}
                updateNotifications={updateNotifications}
                showToast={showToast}
                markNotificationRead={markNotificationRead}
                markAllNotificationsRead={markAllNotificationsRead}
                getUnreadCount={getUnreadCount}
                notificationSettings={user.settings.notifications}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({
  user,
  updateProfile,
  showToast,
}: {
  user: ReturnType<typeof useUserStore.getState>["user"];
  updateProfile: (data: Partial<Pick<ReturnType<typeof useUserStore.getState>["user"], "username" | "email" | "avatarUrl" | "bio">>) => void;
  showToast: ReturnType<typeof useToast>["showToast"];
}) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = () => {
    if (!username.trim()) {
      showToast({ type: "error", message: "昵称不能为空" });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      showToast({ type: "error", message: "请输入有效的邮箱地址" });
      return;
    }
    updateProfile({ username, email, bio });
    showToast({ type: "success", message: "个人资料已保存" });
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast({ type: "error", message: "请填写所有密码字段" });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: "error", message: "两次输入的新密码不一致" });
      return;
    }
    if (newPassword.length < 6) {
      showToast({ type: "error", message: "新密码长度至少6位" });
      return;
    }
    showToast({ type: "success", message: "密码修改成功" });
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass rounded-2xl p-6">
        <h2 className="section-title">账号资料</h2>

        <div className="flex items-start gap-6 mb-8">
          <div className="relative group">
            <img
              src={user.avatarUrl}
              alt="头像"
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
            />
            <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex-1 pt-2">
            <p className="text-lg font-medium text-gray-100">{user.username}</p>
            <p className="text-sm text-gray-400">点击头像更换</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <User className="w-4 h-4 text-primary" />
              昵称
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="请输入昵称"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Mail className="w-4 h-4 text-primary" />
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="请输入邮箱"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            个人简介
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="input resize-none"
            placeholder="介绍一下你自己吧..."
          />
        </div>

        <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          保存资料
        </button>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="section-title">修改密码</h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              当前密码
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input"
              placeholder="请输入当前密码"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              新密码
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder="请输入新密码（至少6位）"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              确认新密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="请再次输入新密码"
            />
          </div>

          <button onClick={handleChangePassword} className="btn-secondary flex items-center gap-2">
            <Lock className="w-4 h-4" />
            修改密码
          </button>
        </div>
      </section>
    </div>
  );
}

function ScheduleSection({
  schedule,
  updateSchedule,
  showToast,
}: {
  schedule: ReturnType<typeof useUserStore.getState>["user"]["schedule"];
  updateSchedule: (schedule: Partial<ReturnType<typeof useUserStore.getState>["user"]["schedule"]>) => void;
  showToast: ReturnType<typeof useToast>["showToast"];
}) {
  const [enabled, setEnabled] = useState(schedule.enabled);
  const [interval, setInterval] = useState<ScheduleInterval>(schedule.interval);
  const [customHours, setCustomHours] = useState<number>(schedule.customHours || 24);
  const [sourceType, setSourceType] = useState<ScheduleSourceType>(schedule.sourceType);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    updateSchedule({ enabled: checked });
    showToast({ type: "success", message: checked ? "换图计划已开启" : "换图计划已关闭" });
  };

  const handleSave = () => {
    updateSchedule({
      enabled,
      interval,
      customHours: interval === "custom" ? customHours : undefined,
      sourceType,
    });
    showToast({ type: "success", message: "换图计划已更新" });
  };

  const intervals: { value: ScheduleInterval; label: string }[] = [
    { value: "hourly", label: "每小时" },
    { value: "daily", label: "每天" },
    { value: "weekly", label: "每周" },
    { value: "custom", label: "自定义" },
  ];

  const sources: { value: ScheduleSourceType; label: string; icon: typeof Heart }[] = [
    { value: "favorites", label: "我的收藏", icon: Heart },
    { value: "subscription", label: "订阅来源", icon: UserPlus },
    { value: "tag", label: "关注标签", icon: Tags },
    { value: "all", label: "全部壁纸", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass rounded-2xl p-6">
        <h2 className="section-title">换图计划</h2>

        <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${enabled ? "bg-primary/15" : "bg-surface-light"}`}>
              <Power className={`w-6 h-6 ${enabled ? "text-primary" : "text-gray-500"}`} />
            </div>
            <div>
              <p className="font-medium text-gray-100">自动换壁纸</p>
              <p className="text-sm text-gray-400">开启后将按设定时间自动更换桌面壁纸</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle(!enabled)}
            className={`relative w-14 h-8 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-surface-hover"}`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${enabled ? "translate-x-7" : "translate-x-1"}`}
            />
          </button>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            换图间隔
          </label>
          <div className="grid grid-cols-4 gap-3">
            {intervals.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setInterval(value)}
                disabled={!enabled}
                className={`py-3 rounded-xl border font-medium transition-all ${
                  interval === value
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-surface border-border text-gray-300 hover:border-primary/30 disabled:opacity-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {interval === "custom" && (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={customHours}
                onChange={(e) => setCustomHours(Number(e.target.value))}
                disabled={!enabled}
                className="input w-32"
              />
              <span className="text-gray-400">小时</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
            <Palette className="w-4 h-4 text-primary" />
            壁纸来源
          </label>
          <div className="grid grid-cols-2 gap-3">
            {sources.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSourceType(value)}
                disabled={!enabled}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  sourceType === value
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-surface border-border text-gray-300 hover:border-primary/30 disabled:opacity-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={!enabled} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          保存设置
        </button>
      </section>
    </div>
  );
}

type SubscriptionTab = "subscribed" | "recommended";

function SubscriptionSection({
  subscriptions,
  subscribe,
  unsubscribe,
  isSubscribed,
  showToast,
  navigate,
  notificationsEnabled,
}: {
  subscriptions: ReturnType<typeof useFavoriteStore.getState>["subscriptions"];
  subscribe: (authorId: string) => void;
  unsubscribe: (authorId: string) => void;
  isSubscribed: (authorId: string) => boolean;
  showToast: ReturnType<typeof useToast>["showToast"];
  navigate: (to: string) => void;
  notificationsEnabled: boolean;
}) {
  const { notifications, addNotification } = useFavoriteStore();
  const { wallpapers } = useWallpaperStore();
  const [subTab, setSubTab] = useState<SubscriptionTab>("subscribed");

  const subscribedAuthors = useMemo(() => authors.filter((a) => isSubscribed(a.id)), [isSubscribed]);
  const recommendedAuthors = useMemo(
    () => authors.filter((a) => !isSubscribed(a.id)).slice(0, 6),
    [isSubscribed]
  );

  const recentUpdates = useMemo(() => {
    return notifications
      .filter((n) => n.type === "subscription_update" && n.authorId)
      .filter((n) => subscribedAuthors.some((a) => a.id === n.authorId))
      .slice(0, 5)
      .map((n) => ({
        notificationId: n.id,
        authorId: n.authorId!,
        authorName: n.authorName || "未知作者",
        authorAvatar: n.authorAvatar || authors.find((a) => a.id === n.authorId)?.avatarUrl,
        time: formatDate(n.createdAt),
        content: n.description,
        wallpaperId: n.wallpaperId,
        wallpaperThumbnail: n.wallpaperThumbnail,
      }));
  }, [notifications, subscribedAuthors]);

  const getAuthorLatestThumbnail = (authorId: string): string | undefined => {
    const authorNotifications = notifications
      .filter((n) => n.authorId === authorId && n.type === "subscription_update" && n.wallpaperThumbnail)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (authorNotifications.length > 0) {
      return authorNotifications[0].wallpaperThumbnail;
    }
    const authorWallpapers = wallpapers
      .filter((w) => w.authorId === authorId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    if (authorWallpapers.length > 0) {
      return authorWallpapers[0].thumbnailUrl;
    }
    return undefined;
  };

  const getAuthorUpdateFrequency = (authorId: string) => {
    const count = notifications.filter(
      (n) => n.authorId === authorId && n.type === "subscription_update"
    ).length;
    if (count >= 4) return { label: "高频更新", color: "bg-red-500/15 text-red-400 border-red-500/30" };
    if (count >= 2) return { label: "稳定更新", color: "bg-green-500/15 text-green-400 border-green-500/30" };
    return { label: "较少更新", color: "bg-gray-500/15 text-gray-400 border-gray-500/30" };
  };

  const getAuthorSubscribedAt = (authorId: string): string | undefined => {
    const sub = subscriptions.find((s) => s.authorId === authorId);
    return sub ? formatDate(sub.subscribedAt) : undefined;
  };

  const handleSubscribe = (authorId: string, authorName: string) => {
    subscribe(authorId);
    const author = authors.find((a) => a.id === authorId);
    addNotification({
      type: "subscription_update",
      authorId,
      authorName,
      authorAvatar: author?.avatarUrl,
      title: `${authorName} 发布了新壁纸`,
      description: `你已订阅 ${authorName}，后续新作品将在此展示`,
    });
    showToast({ type: "success", message: `已订阅 ${authorName}` });
  };

  const handleUnsubscribe = (authorId: string, authorName: string) => {
    unsubscribe(authorId);
    showToast({ type: "info", message: `已取消订阅 ${authorName}` });
  };

  const handleViewWorks = (authorId: string) => {
    navigate(`/search?author=${authorId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass rounded-2xl p-6">
        <h2 className="section-title">来源订阅</h2>
        <p className="text-gray-400 mb-6">已订阅 {subscriptions.length} 位作者</p>

        <div className="flex gap-2 mb-6 p-1 bg-surface rounded-xl w-fit">
          <button
            onClick={() => setSubTab("subscribed")}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${
              subTab === "subscribed"
                ? "bg-primary text-background"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            已订阅
          </button>
          <button
            onClick={() => setSubTab("recommended")}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${
              subTab === "recommended"
                ? "bg-primary text-background"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            推荐作者
          </button>
        </div>

        {subTab === "subscribed" && (
          <>
            {notificationsEnabled && subscribedAuthors.length > 0 && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-primary/5 border border-primary/20 rounded-xl">
                <BellRing className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 text-sm">
                  <p className="text-gray-100 font-medium">订阅更新通知已开启</p>
                  <p className="text-gray-400">关注的作者发布新作品时会及时提醒你</p>
                </div>
              </div>
            )}

            {subscribedAuthors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  最近更新
                </h3>
                {recentUpdates.length > 0 ? (
                  <div className="space-y-2">
                    {recentUpdates.map((update) => (
                      <button
                        key={update.notificationId}
                        onClick={() => {
                          if (update.wallpaperId) {
                            navigate(`/wallpaper/${update.wallpaperId}`);
                          } else {
                            navigate(`/search?author=${update.authorId}`);
                          }
                        }}
                        className="w-full text-left flex items-center gap-3 p-3 bg-surface-light/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        {update.wallpaperThumbnail ? (
                          <img
                            src={update.wallpaperThumbnail}
                            alt={update.authorName}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <img
                            src={update.authorAvatar}
                            alt={update.authorName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-100">
                            <span className="font-medium">{update.authorName}</span>
                            <span className="text-gray-400 ml-1">{update.content}</span>
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">{update.time}</span>
                        <Eye className="w-4 h-4 text-gray-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-surface-light/50 rounded-lg border border-border/50">
                    <p className="text-sm text-gray-500 mb-3">暂无已订阅作者的更新动态</p>
                    <div className="flex flex-wrap gap-2">
                      {subscribedAuthors.map((author) => (
                        <button
                          key={author.id}
                          onClick={() => handleViewWorks(author.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-border hover:border-primary/30 hover:text-primary transition-colors text-xs text-gray-300"
                        >
                          <img
                            src={author.avatarUrl}
                            alt={author.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          {author.name} 的作品
                          <Eye className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {subscribedAuthors.length === 0 ? (
              <div className="text-center py-16">
                <UserPlus className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">暂无订阅的作者</p>
                <p className="text-gray-500 text-sm mt-1">切换到「推荐作者」发现更多创作者</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscribedAuthors.map((author) => {
                  const latestThumbnail = getAuthorLatestThumbnail(author.id);
                  const freq = getAuthorUpdateFrequency(author.id);
                  const subscribedAt = getAuthorSubscribedAt(author.id);
                  return (
                    <div
                      key={author.id}
                      className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border hover:border-primary/30 transition-colors"
                    >
                      <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-100">{author.name}</p>
                        <p className="text-sm text-gray-400 truncate">{author.bio}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {author.wallpaperCount} 张壁纸
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {author.followerCount.toLocaleString()} 关注
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${freq.color}`}>
                            {freq.label}
                          </span>
                          {subscribedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              订阅于 {subscribedAt}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {latestThumbnail && (
                          <div className="relative group" title="最近作品">
                            <img
                              src={latestThumbnail}
                              alt="最近作品"
                              className="w-12 h-12 rounded-lg object-cover border border-border"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <ImageIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewWorks(author.id)}
                            className="btn-ghost text-primary hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看作品
                          </button>
                          <button
                            onClick={() => handleUnsubscribe(author.id, author.name)}
                            className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4 mr-1" />
                            取消订阅
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {subTab === "recommended" && (
          <>
            {recommendedAuthors.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">暂时没有更多推荐作者</p>
                <p className="text-gray-500 text-sm mt-1">你已经关注了所有作者</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedAuthors.map((author) => (
                  <div
                    key={author.id}
                    className="p-5 bg-surface rounded-xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="w-14 h-14 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-100">{author.name}</p>
                        <p className="text-sm text-gray-400 line-clamp-2 mt-0.5">{author.bio}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {author.wallpaperCount} 张
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {author.followerCount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleSubscribe(author.id, author.name)}
                        className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4"
                      >
                        <UserPlus className="w-4 h-4" />
                        订阅
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function TagsSection({
  followedTags,
  followTag,
  unfollowTag,
  isTagFollowed,
  showToast,
}: {
  followedTags: ReturnType<typeof useFavoriteStore.getState>["followedTags"];
  followTag: (tagId: string, tagName: string) => void;
  unfollowTag: (tagId: string) => void;
  isTagFollowed: (tagId: string) => boolean;
  showToast: ReturnType<typeof useToast>["showToast"];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return allTags;
    const q = searchQuery.toLowerCase();
    return allTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleFollow = (tagId: string, tagName: string) => {
    if (isTagFollowed(tagId)) return;
    followTag(tagId, tagName);
    showToast({ type: "success", message: `已关注标签「${tagName}」` });
  };

  const handleUnfollow = (tagId: string, tagName: string) => {
    unfollowTag(tagId);
    showToast({ type: "info", message: `已取消关注「${tagName}」` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass rounded-2xl p-6">
        <h2 className="section-title">已关注标签</h2>
        <p className="text-gray-400 mb-6">共关注 {followedTags.length} 个标签</p>

        {followedTags.length === 0 ? (
          <div className="text-center py-8 mb-6">
            <Tags className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">暂未关注任何标签</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-8">
            {followedTags.map((ft) => (
              <span
                key={ft.id}
                className="tag tag-active"
              >
                <Hash className="w-3 h-3" />
                {ft.tagName}
                <button
                  onClick={() => handleUnfollow(ft.tagId, ft.tagName)}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="section-title">添加标签</h2>

        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
            placeholder="搜索标签..."
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => {
            const followed = isTagFollowed(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => followed ? handleUnfollow(tag.id, tag.name) : handleFollow(tag.id, tag.name)}
                className={`tag ${followed ? "tag-active" : ""}`}
              >
                <Hash className="w-3 h-3" />
                {tag.name}
                <span className="text-xs text-gray-500 ml-1">({tag.wallpaperCount})</span>
                {!followed && <Plus className="w-3 h-3 ml-1" />}
              </button>
            );
          })}
          {filteredTags.length === 0 && (
            <p className="text-gray-500 text-sm">未找到匹配的标签</p>
          )}
        </div>
      </section>
    </div>
  );
}

type NotificationFilter = "all" | "unread" | "read" | "subscription_update";

type AuthorFilterOption = {
  id: string;
  name: string;
  unreadCount: number;
};

function NotificationsSection({
  notifications,
  updateNotifications,
  showToast,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  notificationSettings,
}: {
  notifications: NotificationMessage[];
  updateNotifications: (notifications: Partial<ReturnType<typeof useUserStore.getState>["user"]["settings"]["notifications"]>) => void;
  showToast: ReturnType<typeof useToast>["showToast"];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;
  notificationSettings: ReturnType<typeof useUserStore.getState>["user"]["settings"]["notifications"];
}) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [activeAuthorFilter, setActiveAuthorFilter] = useState<string>("all");
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
  const [state, setState] = useState(notificationSettings);
  const [viewMode, setViewMode] = useState<"timeline" | "by_author">("timeline");
  const [expandedAuthorId, setExpandedAuthorId] = useState<string | null>(null);

  const unreadCount = useMemo(() => getUnreadCount(), [notifications, getUnreadCount]);

  const authorOptions = useMemo<AuthorFilterOption[]>(() => {
    const map = new Map<string, AuthorFilterOption>();
    notifications.forEach((n) => {
      if (n.type === "subscription_update" && n.authorId && n.authorName) {
        const existing = map.get(n.authorId);
        if (existing) {
          if (!n.read) existing.unreadCount++;
        } else {
          map.set(n.authorId, {
            id: n.authorId,
            name: n.authorName,
            unreadCount: n.read ? 0 : 1,
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => b.unreadCount - a.unreadCount);
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    let result = notifications;
    switch (filter) {
      case "unread":
        result = result.filter((n) => !n.read);
        break;
      case "read":
        result = result.filter((n) => n.read);
        break;
      case "subscription_update":
        result = result.filter((n) => n.type === "subscription_update");
        break;
    }
    if (activeAuthorFilter !== "all") {
      result = result.filter((n) => n.authorId === activeAuthorFilter);
    }
    return result;
  }, [notifications, filter, activeAuthorFilter]);

  const filterTabs: { key: NotificationFilter; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "unread", label: "未读" },
    { key: "read", label: "已读" },
    { key: "subscription_update", label: "订阅更新" },
  ];

  const getTabCount = (key: NotificationFilter) => {
    let base = notifications;
    switch (key) {
      case "unread":
        base = base.filter((n) => !n.read);
        break;
      case "read":
        base = base.filter((n) => n.read);
        break;
      case "subscription_update":
        base = base.filter((n) => n.type === "subscription_update");
        break;
    }
    if (activeAuthorFilter !== "all") {
      base = base.filter((n) => n.authorId === activeAuthorFilter);
    }
    return base.length;
  };

  const authorGroups = useMemo(() => {
    const map = new Map<string, { authorId: string; authorName: string; authorAvatar?: string; notifications: NotificationMessage[]; unreadCount: number }>();
    const systemNotifications: NotificationMessage[] = [];

    filteredNotifications.forEach((n) => {
      if (n.type === "subscription_update" && n.authorId && n.authorName) {
        const existing = map.get(n.authorId);
        if (existing) {
          existing.notifications.push(n);
          if (!n.read) existing.unreadCount++;
        } else {
          map.set(n.authorId, {
            authorId: n.authorId,
            authorName: n.authorName,
            authorAvatar: n.authorAvatar,
            notifications: [n],
            unreadCount: n.read ? 0 : 1,
          });
        }
      } else {
        systemNotifications.push(n);
      }
    });

    return {
      systemNotifications,
      authorGroups: Array.from(map.values()).sort((a, b) => b.unreadCount - a.unreadCount),
    };
  }, [filteredNotifications]);

  const handleMainClick = (notification: NotificationMessage) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
    if (notification.type === "subscription_update") {
      if (notification.wallpaperId) {
        navigate(`/wallpaper/${notification.wallpaperId}`);
      } else if (notification.authorId) {
        navigate(`/search?author=${notification.authorId}`);
      }
    }
  };

  const handleViewAuthorWorks = (e: React.MouseEvent, notification: NotificationMessage) => {
    e.stopPropagation();
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
    if (notification.authorId) {
      navigate(`/search?author=${notification.authorId}`);
    }
  };

  const handleViewAuthorWorksById = (e: React.MouseEvent, authorId: string) => {
    e.stopPropagation();
    navigate(`/search?author=${authorId}`);
  };

  const handleMarkAuthorRead = (authorId: string, authorName: string) => {
    const authorGroup = authorGroups.authorGroups.find((g) => g.authorId === authorId);
    if (authorGroup) {
      authorGroup.notifications.forEach((n) => {
        if (!n.read) {
          markNotificationRead(n.id);
        }
      });
    }
    showToast({ type: "success", message: `已将 ${authorName} 的消息全部标记为已读` });
  };

  const handleMarkSystemRead = () => {
    authorGroups.systemNotifications.forEach((n) => {
      if (!n.read) {
        markNotificationRead(n.id);
      }
    });
    showToast({ type: "success", message: "已将系统通知全部标记为已读" });
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    showToast({ type: "success", message: "已将所有通知标记为已读" });
  };

  const toggleAuthorExpand = (authorId: string) => {
    setExpandedAuthorId((prev) => (prev === authorId ? null : authorId));
  };

  const toggle = (key: keyof typeof notificationSettings) => {
    const newValue = !state[key];
    setState((prev) => ({ ...prev, [key]: newValue }));
    updateNotifications({ [key]: newValue });
    showToast({ type: "info", message: newValue ? "已开启通知" : "已关闭通知" });
  };

  const items: { key: keyof typeof notificationSettings; title: string; desc: string; icon: typeof Download }[] = [
    {
      key: "subscriptionUpdate",
      title: "订阅更新",
      desc: "关注的作者发布新壁纸时通知",
      icon: Download,
    },
    {
      key: "favoriteReminder",
      title: "收藏提醒",
      desc: "收藏的壁纸有更新时通知",
      icon: Heart,
    },
    {
      key: "weeklyDigest",
      title: "每周精选",
      desc: "每周推送热门精选壁纸",
      icon: Sparkles,
    },
    {
      key: "systemNotice",
      title: "系统通知",
      desc: "系统消息与功能更新通知",
      icon: Bell,
    },
  ];

  const selectedAuthorName = authorOptions.find((a) => a.id === activeAuthorFilter)?.name;
  const systemUnreadCount = authorGroups.systemNotifications.filter((n) => !n.read).length;

  const renderNotificationRow = (notification: NotificationMessage) => (
    <div
      key={notification.id}
      className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all ${
        notification.read
          ? "bg-surface border-border hover:border-primary/20"
          : "bg-primary/5 border-primary/20 hover:border-primary/40"
      }`}
    >
      <button
        onClick={() => handleMainClick(notification)}
        className="flex-1 min-w-0 flex items-start gap-3 text-left"
      >
        <div className="shrink-0 mt-0.5">
          {notification.authorAvatar ? (
            <img
              src={notification.authorAvatar}
              alt={notification.authorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
              {notification.type === "system" ? (
                <Bell className="w-5 h-5 text-gray-400" />
              ) : notification.type === "weekly_digest" ? (
                <Sparkles className="w-5 h-5 text-gray-400" />
              ) : (
                <Bell className="w-5 h-5 text-gray-400" />
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium truncate ${notification.read ? "text-gray-300" : "text-gray-100"}`}>
              {notification.title}
            </p>
            {!notification.read && (
              <Circle className="w-2.5 h-2.5 fill-primary text-primary shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{notification.description}</p>
          <p className="text-xs text-gray-500 mt-1.5">{formatDate(notification.createdAt)}</p>
        </div>
        {notification.type === "subscription_update" && notification.wallpaperThumbnail && (
          <img
            src={notification.wallpaperThumbnail}
            alt=""
            className="w-14 h-10 rounded-lg object-cover shrink-0"
          />
        )}
      </button>

      {notification.authorId && (
        <div className="shrink-0 flex flex-col gap-2 ml-2">
          <button
            onClick={(e) => handleViewAuthorWorks(e, notification)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface-hover border border-border text-gray-300 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
            title="查看该作者作品"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">作者作品</span>
          </button>
          {notification.wallpaperId && (
            <div className="text-[10px] text-gray-500 text-center leading-tight px-1">
              点击左侧<br/>查看壁纸
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSystemGroup = () => {
    if (authorGroups.systemNotifications.length === 0) return null;
    const isExpanded = expandedAuthorId === "__system__";
    return (
      <div key="__system__" className="space-y-2">
        <div
          className={`w-full flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            isExpanded
              ? "bg-surface border-primary/30"
              : "bg-surface border-border hover:border-primary/20"
          }`}
          onClick={() => toggleAuthorExpand("__system__")}
        >
          <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-100 truncate">系统通知</p>
              {systemUnreadCount > 0 && (
                <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-medium flex items-center justify-center">
                  {systemUnreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{authorGroups.systemNotifications.length} 条消息</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkSystemRead();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-hover border border-border text-gray-300 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
              title="全部标为已读"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">全部标为已读</span>
            </button>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
        {isExpanded && (
          <div className="pl-4 space-y-2">
            {authorGroups.systemNotifications.map((n) => renderNotificationRow(n))}
          </div>
        )}
      </div>
    );
  };

  const renderAuthorGroup = (group: typeof authorGroups.authorGroups[0]) => {
    const isExpanded = expandedAuthorId === group.authorId;
    return (
      <div key={group.authorId} className="space-y-2">
        <div
          className={`w-full flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            isExpanded
              ? "bg-surface border-primary/30"
              : "bg-surface border-border hover:border-primary/20"
          }`}
          onClick={() => toggleAuthorExpand(group.authorId)}
        >
          {group.authorAvatar ? (
            <img
              src={group.authorAvatar}
              alt={group.authorName}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-100 truncate">{group.authorName}</p>
              {group.unreadCount > 0 && (
                <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-medium flex items-center justify-center">
                  {group.unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{group.notifications.length} 条消息</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={(e) => handleViewAuthorWorksById(e, group.authorId)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-hover border border-border text-gray-300 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
              title="查看作者作品"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">查看作者作品</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAuthorRead(group.authorId, group.authorName);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-hover border border-border text-gray-300 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
              title="全部标为已读"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">全部标为已读</span>
            </button>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
        {isExpanded && (
          <div className="pl-4 space-y-2">
            {group.notifications.map((n) => renderNotificationRow(n))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">消息中心</h2>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-light transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              全部已读
            </button>
          )}
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{unreadCount}</span>
            </div>
            <span className="text-sm text-gray-300">
              你有 <span className="text-primary font-medium">{unreadCount}</span> 条未读消息
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex gap-2 p-1 bg-surface rounded-xl w-fit">
            {filterTabs.map(({ key, label }) => {
              const count = getTabCount(key);
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    filter === key
                      ? "bg-primary text-background"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span
                      className={`ml-1.5 text-xs ${
                        filter === key ? "text-background/70" : "text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1 p-1 bg-surface rounded-xl w-fit">
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                viewMode === "timeline"
                  ? "bg-primary text-background"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              时间流
            </button>
            <button
              onClick={() => setViewMode("by_author")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                viewMode === "by_author"
                  ? "bg-primary text-background"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Users className="w-4 h-4" />
              按作者分组
            </button>
          </div>

          {authorOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setAuthorDropdownOpen((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                  activeAuthorFilter !== "all"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-surface border-border text-gray-300 hover:border-primary/20"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="font-medium">
                  {activeAuthorFilter !== "all" ? selectedAuthorName : "全部作者"}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${authorDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {authorDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAuthorDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-56 glass rounded-xl border border-border shadow-xl z-20 py-1 max-h-72 overflow-y-auto">
                    <button
                      onClick={() => {
                        setActiveAuthorFilter("all");
                        setAuthorDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        activeAuthorFilter === "all"
                          ? "bg-primary/10 text-primary"
                          : "text-gray-300 hover:bg-surface-hover"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        全部作者
                      </span>
                    </button>
                    {authorOptions.map((author) => (
                      <button
                        key={author.id}
                        onClick={() => {
                          setActiveAuthorFilter(author.id);
                          setAuthorDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                          activeAuthorFilter === author.id
                            ? "bg-primary/10 text-primary"
                            : "text-gray-300 hover:bg-surface-hover"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <User className="w-4 h-4 shrink-0" />
                          <span className="truncate">{author.name}</span>
                        </span>
                        {author.unreadCount > 0 && (
                          <span className="ml-2 shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                            {author.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {activeAuthorFilter !== "all" && selectedAuthorName && (
          <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-surface border border-border rounded-xl">
            <span className="text-xs text-gray-400">当前筛选：</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
              <User className="w-3 h-3" />
              {selectedAuthorName}
            </span>
            <button
              onClick={() => setActiveAuthorFilter("all")}
              className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-surface-hover transition-colors"
              title="清除作者筛选"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Inbox className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">暂无{filter === "unread" ? "未读" : filter === "read" ? "已读" : filter === "subscription_update" ? "订阅更新" : ""}通知</p>
              <p className="text-gray-500 text-sm mt-1">去发现更多精彩壁纸和创作者吧</p>
              <button
                onClick={() => navigate("/search")}
                className="mt-4 btn-primary text-sm py-2 px-4"
              >
                探索壁纸
              </button>
            </div>
          ) : viewMode === "timeline" ? (
            filteredNotifications.map((notification) => renderNotificationRow(notification))
          ) : (
            <div className="space-y-3">
              {renderSystemGroup()}
              {authorGroups.authorGroups.map((group) => renderAuthorGroup(group))}
            </div>
          )}
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="section-title">通知设置</h2>
        <p className="text-gray-400 mb-6">管理你想接收的通知类型</p>

        <div className="space-y-3">
          {items.map(({ key, title, desc, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-100">{title}</p>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${state[key] ? "bg-primary" : "bg-surface-hover"}`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${state[key] ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
