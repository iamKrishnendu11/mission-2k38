"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { ShieldCheck, UserCheck, ShieldAlert, BarChart2, Video, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDeleteVideo = async (videoId) => {
    try {
      await api.delete(`/videos/${videoId}`);
      setData(prev => prev ? {
        ...prev,
        recentVideos: (prev.recentVideos || []).filter(v => v._id !== videoId)
      } : prev);
    } catch (err) {
      setError("Failed to delete video: " + err.message);
    }
  };

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = () => {
    setLoading(true);
    api.get("/dashboard/admin/dashboard")
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Admin validation failed. Access denied.");
        setLoading(false);
      });
  };

  const handleVerifyUser = async (targetUserId, verify) => {
    try {
      await api.post("/dashboard/admin/verify", { targetUserId, verify });
      alert(verify ? "User Verified Successfully!" : "Verification Revoked.");
      loadAdminStats();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-550 text-sm tracking-widest font-bold uppercase font-sans">Connecting Admin Console...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center max-w-xl mx-auto mt-20">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-red-500 font-bold mb-2">Access Restrained</h3>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, pendingScouts = [], pendingCoaches = [], recentVideos = [] } = data;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2">
            <ShieldCheck className="text-yellow-400 w-8 h-8" /> Security Operations Center
          </h2>
          <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold">
            Verify credentials, approve uploads, and audit metrics
          </p>
        </div>

        {/* COUNTERS */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Users", val: stats.totalUsers },
            { label: "Players", val: stats.totalPlayers },
            { label: "Scouts", val: stats.totalScouts },
            { label: "Coaches", val: stats.totalCoaches },
            { label: "Videos", val: stats.totalVideos },
            { label: "Analyses", val: stats.totalAnalyses },
          ].map(c => (
            <div key={c.label} className="bg-zinc-905 border border-zinc-800 rounded-2xl p-4">
              <span className="block text-[8px] uppercase tracking-widest text-zinc-505 font-bold mb-1">{c.label}</span>
              <span className="text-2xl font-black text-white">{c.val}</span>
            </div>
          ))}
        </div>

        {/* VERIFICATION PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PENDING SCOUTS */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 border-b border-zinc-800 pb-4 flex items-center gap-2">
              <UserCheck className="text-yellow-400 w-5 h-5" /> Pending Scout Verification
            </h3>
            
            {pendingScouts.length === 0 ? (
              <div className="text-center py-8 text-zinc-550 text-xs">
                No pending scouts requiring verification.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingScouts.map(s => (
                  <div key={s.user?._id || s._id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-white font-bold text-xs">{s.name}</h4>
                      <p className="text-[10px] text-zinc-400">Org: {s.organization} | License: {s.license}</p>
                    </div>
                    <button 
                      onClick={() => handleVerifyUser(s.user?._id || s.user, true)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-lg transition-all"
                    >
                      Verify Badge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PENDING COACHES */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 border-b border-zinc-800 pb-4 flex items-center gap-2">
              <UserCheck className="text-yellow-400 w-5 h-5" /> Pending Coach Verification
            </h3>
            
            {pendingCoaches.length === 0 ? (
              <div className="text-center py-8 text-zinc-550 text-xs">
                No pending coaches requiring verification.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCoaches.map(c => (
                  <div key={c.user?._id || c._id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-white font-bold text-xs">{c.name}</h4>
                      <p className="text-[10px] text-zinc-400">License: {c.license} | Exp: {c.experience} yrs</p>
                    </div>
                    <button 
                      onClick={() => handleVerifyUser(c.user?._id || c.user, true)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-lg transition-all"
                    >
                      Verify Badge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RECENT UPLOADS AUDIT */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 border-b border-zinc-800 pb-4 flex items-center gap-2">
            <Video className="text-yellow-400 w-5 h-5" /> Global Video Upload History
          </h3>

          {recentVideos.length === 0 ? (
            <div className="text-center py-8 text-zinc-550 text-xs">
              No videos uploaded on platform yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recentVideos.map(v => (
                <div key={v._id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="text-white font-bold text-xs">{v.title}</h4>
                    <p className="text-[10px] text-zinc-400">Player: {v.playerName} | Drill: {v.drillType}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                      v.isAnalyzed 
                        ? "bg-green-400/10 text-green-400 border-green-500/20" 
                        : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                    }`}>
                      {v.isAnalyzed ? "AI Analyzed" : "Pending AI"}
                    </span>
                    <button
                      onClick={() => handleDeleteVideo(v._id)}
                      title="Delete Video"
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-600 border border-red-800/40 hover:border-red-500 text-red-400 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
