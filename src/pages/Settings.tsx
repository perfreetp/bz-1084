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
  Hash,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useToast } from "@/hooks/useToast";
import { authors } from "@/data/authors";
import { allTags } from "@/data/tags";
import type { ScheduleInterval, ScheduleSourceType } from "@/types";

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
  const { subscriptions, followedTags, subscribe, unsubscribe, followTag, unfollowTag, isSubscribed, isTagFollowed } = useFavoriteStore();
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
                unsubscribe={unsubscribe}
                isSubscribed={isSubscribed}
                showToast={showToast}
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
                notifications={user.settings.notifications}
                updateNotifications={updateNotifications}
                showToast={showToast}
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

function SubscriptionSection({
  subscriptions,
  unsubscribe,
  isSubscribed,
  showToast,
}: {
  subscriptions: ReturnType<typeof useFavoriteStore.getState>["subscriptions"];
  unsubscribe: (authorId: string) => void;
  isSubscribed: (authorId: string) => boolean;
  showToast: ReturnType<typeof useToast>["showToast"];
}) {
  const subscribedAuthors = authors.filter((a) => isSubscribed(a.id));

  const handleUnsubscribe = (authorId: string, authorName: string) => {
    unsubscribe(authorId);
    showToast({ type: "info", message: `已取消订阅 ${authorName}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass rounded-2xl p-6">
        <h2 className="section-title">来源订阅</h2>
        <p className="text-gray-400 mb-6">已订阅 {subscriptions.length} 位作者</p>

        {subscribedAuthors.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">暂无订阅的作者</p>
            <p className="text-gray-500 text-sm mt-1">浏览壁纸时可以关注喜欢的作者</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscribedAuthors.map((author) => (
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
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {author.wallpaperCount} 张壁纸
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {author.followerCount.toLocaleString()} 关注
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnsubscribe(author.id, author.name)}
                  className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  取消订阅
                </button>
              </div>
            ))}
          </div>
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

function NotificationsSection({
  notifications,
  updateNotifications,
  showToast,
}: {
  notifications: ReturnType<typeof useUserStore.getState>["user"]["settings"]["notifications"];
  updateNotifications: (notifications: Partial<ReturnType<typeof useUserStore.getState>["user"]["settings"]["notifications"]>) => void;
  showToast: ReturnType<typeof useToast>["showToast"];
}) {
  const [state, setState] = useState(notifications);

  const toggle = (key: keyof typeof notifications) => {
    const newValue = !state[key];
    setState((prev) => ({ ...prev, [key]: newValue }));
    updateNotifications({ [key]: newValue });
    showToast({ type: "info", message: newValue ? "已开启通知" : "已关闭通知" });
  };

  const items: { key: keyof typeof notifications; title: string; desc: string; icon: typeof Download }[] = [
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

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass rounded-2xl p-6">
        <h2 className="section-title">消息提醒</h2>
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
