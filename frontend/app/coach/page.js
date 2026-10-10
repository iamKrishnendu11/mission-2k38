"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, Users, Award, Star, ShieldCheck, ArrowRight, User } from "lucide-react";
import { SlidingButton } from "@/app/login/components/SlidingButton";

export default function CoachDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/dashboard/coach/dashboard")
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load coach metrics.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm tracking-widest font-bold uppercase font-sans">Opening Coaching Desk...</p>
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

  const { profile, team = [] } = data;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-0">
        {/* BANNER */}
        <div className="relative rounded-[32px] overflow-hidden bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(circle_at_right_bottom,rgba(250,204,21,0.08),transparent_60%)] pointer-events-none" />
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className="bg-yellow-400/10 text-yellow-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-yellow-400/20">
                Staff Dashboard
              </span>
              {profile?.verifiedBadge && (
                <span className="bg-green-500/10 text-green-400 text-xs font-bold uppercase px-3 py-1 rounded-full border border-green-500/20">
                  Verified Trainer License
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Coach: <span className="text-yellow-400 capitalize">{profile?.name}</span>
            </h1>
            <p className="text-white/50 mt-3 max-w-xl text-sm leading-relaxed font-medium">
              License: <strong className="text-white">{profile?.license || "AFC License"}</strong> | Managed Club: <strong className="text-white">{profile?.clubRepresenting || "Minerva Academy"}</strong>. Coordinates team practices and youth drills.
            </p>
          </div>
          <SlidingButton 
            onClick={() => router.push("/coach/tournaments")} 
            className="w-full md:w-auto h-14 px-8 font-black uppercase tracking-widest text-sm"
          >
            Organize Tournament
          </SlidingButton>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[24px] p-8 flex flex-col relative overflow-hidden backdrop-blur-xl">
            <span className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-1">Club Roster Size</span>
            <span className="text-4xl font-black text-yellow-400 tracking-tight">{team.length}</span>
            <span className="text-sm font-bold text-white/40 mt-1">Active Players</span>
          </div>
          <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[24px] p-8 flex flex-col relative overflow-hidden backdrop-blur-xl">
            <span className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-1">Coaching License Tier</span>
            <span className="text-2xl font-black text-white mt-1 uppercase tracking-tight">{profile?.license || "AFC C Certificate"}</span>
          </div>
          <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[24px] p-8 flex flex-col relative overflow-hidden backdrop-blur-xl">
            <span className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-1">Experience Level</span>
            <span className="text-4xl font-black text-white/90 tracking-tight">{profile?.experience || 0}</span>
            <span className="text-sm font-bold text-white/40 mt-1">Years Active</span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[32px] p-8 md:p-10 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/[0.04] pb-5">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                <Users className="text-yellow-400 drop-shadow-md w-5 h-5" /> Squad Board
              </h3>
              <button onClick={() => router.push("/coach/squad")} className="text-yellow-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                Manage Squad <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {team.length === 0 ? (
              <div className="text-center py-16 text-white/40 text-sm font-medium">
                No squad players found in this state or club.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.slice(0, 3).map((p) => (
                  <div key={p._id} className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.04] hover:border-yellow-400/40 flex items-center space-x-4 transition-all group cursor-pointer">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/[0.05] bg-white/[0.02] shrink-0 flex items-center justify-center">
                      {p.profilePhoto && !p.profilePhoto.includes("undefined") && !p.profilePhoto.includes("null") ? (
                        <img src={p.profilePhoto} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <User className="w-5 h-5 text-white/20" />
                      )}
                    </div>
                    <div className="truncate flex-1">
                      <h4 className="text-white font-bold text-sm truncate flex items-center gap-1.5">
                        {p.name}
                        {p.verifiedBadge && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                      </h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-bold">
                        Pos: <span className="text-white/70">{p.preferredPosition}</span> | Rating: <span className="text-yellow-400">{p.skills?.aiScore || 60}</span>
                      </p>
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
