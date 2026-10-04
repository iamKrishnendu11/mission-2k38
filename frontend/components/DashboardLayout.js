"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, getSocketUrl } from "@/lib/api";
import {
  Home, User, Video, TrendingUp, Trophy, Users,
  MessageSquare, Bell, Settings, LogOut, Search, BookOpen, ShieldAlert, FileText
} from "lucide-react";
import Image from "next/image";

import { io as ioClient } from "socket.io-client";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let socket;
    let pollInterval;

    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      const profileStr = localStorage.getItem("profile");

      if (!userStr) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(userStr);
      setCurrentUser(parsedUser);
      const rawUserId = parsedUser.id || parsedUser._id || parsedUser.userId || (parsedUser.user ? parsedUser.user.id || parsedUser.user._id : null);
      const cleanUserId = typeof rawUserId === "object" ? (rawUserId._id || rawUserId.id)?.toString() : rawUserId?.toString();

      const syncProfile = () => {
        api.get("/dashboard/profile")
          .then(res => {
            const freshProfile = res?.profile || res;
            if (freshProfile && (freshProfile.name || freshProfile.profilePhoto)) {
              setCurrentProfile(freshProfile);
              localStorage.setItem("profile", JSON.stringify(freshProfile));
            }
          })
          .catch(err => console.error("Profile auto-sync notice:", err));
      };

      // 0. Auto-sync user profile to update name & profilePhoto
      syncProfile();
      window.addEventListener("profile-updated", syncProfile);

      // 1. Initial Notification Load
      const loadNotifications = () => {
        api.get("/social/notifications")
          .then(data => {
            if (Array.isArray(data)) {
              setNotifications(data);
              setUnreadCount(data.filter(n => !n.read).length);
            }
          })
          .catch(err => console.error("Error loading notifications:", err));
      };

      loadNotifications();

      // 2. Real-Time Socket.io Connection & Listening
      try {
        socket = ioClient(getSocketUrl(), {
          transports: ["websocket", "polling"],
          reconnection: true
        });

        if (cleanUserId) {
          socket.emit("join", cleanUserId);
        }

        socket.on("connect", () => {
          if (cleanUserId) {
            socket.emit("join", cleanUserId);
          }
        });

        socket.on("notification:new", (newNotif) => {
          setNotifications(prev => [newNotif, ...prev.filter(n => n._id !== newNotif._id)]);
          setUnreadCount(prev => prev + 1);
        });
      } catch (sErr) {
        console.warn("Socket.io connect notice:", sErr);
      }

      // 3. Fallback 5-second background sync
      pollInterval = setInterval(() => {
        loadNotifications();
      }, 5000);
    }

    return () => {
      if (socket) socket.disconnect();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [router]);

  const handleSignOut = () => {
    api.clearTokens();
    router.push("/login");
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/social/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Get navigation links based on user role
  const getNavLinks = () => {
    const role = currentUser.role;
    if (role === "player") {
      return [
        { name: "Home", href: "/player", icon: Home },
        { name: "My Card", href: "/player/profile", icon: User },
        { name: "AI Coach", href: "/player/coach", icon: Video },
        { name: "Analytics", href: "/player/analytics", icon: TrendingUp },
        { name: "Upload Video", href: "/player/upload", icon: Video },
        { name: "Tournaments", href: "/player/tournaments", icon: Trophy },
        { name: "Scout Reports", href: "/scout/reports", icon: FileText },
        { name: "Community", href: "/player/community", icon: Users },
        { name: "Messages", href: "/player/messages", icon: MessageSquare },
        { name: "Profile", href: "/player/settings", icon: Settings },
      ];
    } else if (role === "scout") {
      return [
        { name: "Dashboard", href: "/scout", icon: Home },
        { name: "Search Players", href: "/scout/search", icon: Search },
        { name: "Trials Calendar", href: "/scout/trials", icon: Trophy },
        { name: "Saved Players", href: "/scout/saved", icon: BookOpen },
        { name: "Scout Reports", href: "/scout/reports", icon: FileText },
        { name: "Messages", href: "/scout/messages", icon: MessageSquare },
        { name: "Settings", href: "/scout/settings", icon: Settings },
      ];
    } else if (role === "coach") {
      return [
        { name: "Dashboard", href: "/coach", icon: Home },
        { name: "Squad Board", href: "/coach/squad", icon: Users },
        { name: "Tournaments", href: "/coach/tournaments", icon: Trophy },
        { name: "Scout Reports", href: "/scout/reports", icon: FileText },
        { name: "Messages", href: "/coach/messages", icon: MessageSquare },
        { name: "Settings", href: "/coach/settings", icon: Settings },
      ];
    } else if (role === "admin") {
      return [
        { name: "Admin Panel", href: "/admin", icon: ShieldAlert },
        { name: "Scout Reports", href: "/scout/reports", icon: FileText },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* FIXED SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-72 h-screen fixed top-0 left-0 z-40 bg-zinc-950/90 border-r border-zinc-800/80 backdrop-blur-xl p-6 select-none">
        <div className="flex items-center space-x-3 mb-8 px-2 shrink-0">
          <div className="flex items-center justify-center">
            <Image src="/logo.png" alt="Mission 2K38" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest text-white leading-none">
              MISSION <span className="text-yellow-400">2K38</span>
            </h1>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              AI Grassroots Football
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center space-x-3 shrink-0">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-zinc-800 border border-yellow-400/30 flex items-center justify-center">
            {currentProfile?.profilePhoto ? (
              <img
                src={currentProfile.profilePhoto}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-black uppercase text-yellow-400">
                {(currentProfile?.name || currentUser.email).charAt(0)}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">
              {currentProfile?.name || currentUser.email.split('@')[0]}
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-400/90 block truncate">
              {currentProfile?.currentClub || currentUser?.role} {currentProfile?.verifiedBadge && "✓"}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1" data-lenis-prevent>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <button
                key={link.name}
                onClick={() => router.push(link.href)}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border-l-4 border-yellow-400 text-yellow-400"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-yellow-400" : "text-zinc-500 group-hover:text-white"}`} />
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout action */}
        <div className="pt-4 border-t border-zinc-800/80 shrink-0">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg text-sm font-semibold tracking-wider text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="flex lg:hidden flex-col w-full min-h-screen bg-black">
        <header className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-2">
            <h1 className="text-md font-black tracking-widest text-white">
              MISSION <span className="text-yellow-400">2K38</span>
            </h1>
          </div>

          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-1 text-zinc-400 hover:text-white">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Slide-out Menu */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
            <aside className="relative flex flex-col w-64 bg-zinc-950 p-6 border-r border-zinc-800">
              <nav className="flex-1 space-y-2 mt-8">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <button
                      key={link.name}
                      onClick={() => {
                        router.push(link.href);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center space-x-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                          ? "bg-yellow-400 text-black font-bold"
                          : "text-zinc-400 hover:text-white"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </button>
                  );
                })}
              </nav>
              <button onClick={handleSignOut} className="w-full flex items-center space-x-4 px-4 py-3 text-sm text-zinc-500 hover:text-red-400">
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* DESKTOP BODY WRAPPER WITH LEFT PADDING FOR FIXED SIDEBAR */}
      <div className="hidden lg:flex flex-col flex-1 min-w-0 lg:pl-72 min-h-screen">
        {/* TOPBAR */}
        <header className="h-20 sticky top-0 z-30 bg-zinc-950/40 border-b border-zinc-800/40 backdrop-blur-md flex items-center justify-end px-10 select-none shrink-0">
          <div className="flex items-center space-x-6">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 hover:text-white transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-yellow-400 text-black text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                      Notifications ({unreadCount})
                    </h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-900" data-lenis-prevent>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 text-xs">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id)}
                          className={`p-4 hover:bg-zinc-900/30 transition-all cursor-pointer ${!n.read ? 'bg-yellow-400/5' : ''}`}
                        >
                          <h4 className="text-xs font-bold text-white">{n.title}</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">{n.message}</p>
                          <span className="text-[9px] text-zinc-500 mt-2 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User status */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-zinc-400">
                Welcome, <strong className="text-white">{currentProfile?.name || currentUser.email.split('@')[0]}</strong>
              </span>
              <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-yellow-400/20 flex items-center justify-center">
                {currentProfile?.profilePhoto ? (
                  <img
                    src={currentProfile.profilePhoto}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-black uppercase text-yellow-400">
                    {(currentProfile?.name || currentUser.email).charAt(0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-6 md:p-10 bg-zinc-950/20">
          {children}
        </main>
      </div>
    </div>
  );
}
