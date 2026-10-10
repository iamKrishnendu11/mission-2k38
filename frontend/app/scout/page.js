"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Calendar, Award, Star, Users, ArrowRight, User } from "lucide-react";
import { SlidingButton } from "@/app/login/components/SlidingButton";

export default function ScoutDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/dashboard/scout/dashboard")
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load scout data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm tracking-widest font-bold uppercase font-sans">Accessing Scout Grid...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
          <h3 className="text-red-500 font-bold mb-2">Error Loading Dashboard</h3>
          <p className="text-zinc-400">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, trials = [], savedPlayers = [], acceptedCount = 0 } = data;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-0">
        {/* HERO */}
        <div className="relative rounded-[32px] overflow-hidden bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(circle_at_right_bottom,rgba(250,204,21,0.08),transparent_60%)] pointer-events-none" />
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-yellow-400/10 text-yellow-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-yellow-400/20">
                Agency Board
              </span>
              {profile?.verifiedBadge ? (
                <span className="bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-500/20">
                  Verified Scout Credentials
                </span>
              ) : (
                <span className="bg-white/[0.04] text-white/50 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/[0.05]">
                  Pending Verification
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Scout Portal: <span className="text-yellow-400 capitalize">{profile?.name || "Agent"}</span>
            </h1>
            <p className="text-white/50 mt-3 max-w-xl text-sm leading-relaxed font-medium">
              Representing <strong className="text-white">{profile?.clubRepresenting || profile?.organization || "Grassroots Academy"}</strong>. Utilize biometric filters to pinpoint elite potential.
            </p>
          </div>
          <SlidingButton 
            onClick={() => router.push("/scout/search")} 
            className="w-full md:w-auto h-14 px-8 font-black uppercase tracking-widest text-sm"
          >
            Launch Player Search
          </SlidingButton>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[24px] p-8 flex flex-col relative overflow-hidden backdrop-blur-xl">
            <span className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-1">Saved Prospects</span>
            <span className="text-4xl font-black text-yellow-400 tracking-tight">{savedPlayers.length}</span>
          </div>
          <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[24px] p-8 flex flex-col relative overflow-hidden backdrop-blur-xl">
            <span className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-1">Active Trials</span>
            <span className="text-4xl font-black text-white tracking-tight">{trials.length}</span>
          </div>
          <div className="bg-[#121214] border border-green-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[24px] p-8 flex flex-col relative overflow-hidden backdrop-blur-xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />
            <span className="block text-[11px] uppercase tracking-widest text-green-400 font-bold mb-1 relative z-10">Confirmed Accepted</span>
            <span className="text-4xl font-black text-green-400 tracking-tight relative z-10">{acceptedCount}</span>
          </div>
          <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[24px] p-8 flex flex-col relative overflow-hidden backdrop-blur-xl">
            <span className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-1">Representing</span>
            <span className="text-lg font-black text-white uppercase truncate block tracking-tight mt-1">{profile?.clubRepresenting || "Grassroots Academy"}</span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TRIALS LIST */}
          <div className="lg:col-span-2 bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[32px] p-8 md:p-10 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/[0.04] pb-5">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                <Calendar className="text-yellow-400 drop-shadow-md w-5 h-5" /> Trial Calendar Schedule
              </h3>
              <button onClick={() => router.push("/scout/trials")} className="text-yellow-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                Full Calendar <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {trials.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white/20" />
                </div>
                <h4 className="text-sm font-bold text-white/70 mb-1">No Scheduled Trials</h4>
                <p className="text-xs font-medium text-white/40 max-w-sm">No trials scheduled. Search players to invite them for tryouts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trials.slice(0, 4).map((t) => (
                  <div key={t._id} className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.04] hover:border-yellow-400/40 flex justify-between items-center transition-all group">
                    <div>
                      <h4 className="text-white font-bold text-sm">Player: <span className="text-white/70">{t.playerProfile?.name || "Academy Prospect"}</span></h4>
                      <p className="text-[11px] text-white/40 uppercase tracking-widest mt-1 font-bold">Loc: {t.location} | Time: {t.time}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] px-4 py-2.5 rounded-xl text-center font-black text-[11px] text-yellow-400 shrink-0">
                      {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAVED PLAYERS */}
          <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[32px] p-8 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/[0.04] pb-5">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                <Star className="text-yellow-400 drop-shadow-md w-5 h-5" /> Saved Prospects
              </h3>
              <button onClick={() => router.push("/scout/saved")} className="text-yellow-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                All Saved <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {savedPlayers.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-white/20" />
                </div>
                <h4 className="text-sm font-bold text-white/70 mb-1">No Saved Players</h4>
                <p className="text-xs font-medium text-white/40">Use search to build a list.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedPlayers.slice(0, 3).map((p) => (
                  <div key={p._id} className="p-4 rounded-2xl bg-[#0a0a0c] border border-white/[0.04] hover:border-yellow-400/40 flex items-center space-x-4 transition-all group cursor-pointer">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/[0.05] bg-white/[0.02] shrink-0 flex items-center justify-center">
                      {p.profilePhoto && !p.profilePhoto.includes("undefined") && !p.profilePhoto.includes("null") ? (
                        <img src={p.profilePhoto} alt="Player" className="w-full h-full object-cover group-hover:scale-110 transition-transform" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <User className="w-5 h-5 text-white/20" />
                      )}
                    </div>
                    <div className="truncate flex-1">
                      <h4 className="text-white font-bold text-sm truncate">{p.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mt-1">
                        POS: <span className="text-white/70">{p.preferredPosition}</span> | Rating: <span className="text-yellow-400">{p.skills?.aiScore || 60}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
