"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, Users, Award, Star, ShieldCheck, ArrowRight } from "lucide-react";

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
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-zinc-800 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none uppercase">
              Coach: <span className="text-yellow-400">{profile?.name}</span>
            </h1>
            <p className="text-zinc-400 mt-3 max-w-xl text-sm leading-relaxed">
              License: <strong className="text-white">{profile?.license || "AFC License"}</strong> | Managed Club: <strong className="text-white">{profile?.clubRepresenting || "Minerva Academy"}</strong>. Coordinates team practices and youth drills.
            </p>
          </div>
          <button 
            onClick={() => router.push("/coach/tournaments")} 
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-widest px-6 py-4 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all hover:scale-105"
          >
            Organize Tournament →
          </button>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Club Roster Size</span>
            <span className="text-4xl font-black text-yellow-400">{team.length} Active Players</span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Coaching License tier</span>
            <span className="text-2xl font-black text-white uppercase mt-2 block">{profile?.license || "AFC C Certificate"}</span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Experience level</span>
            <span className="text-4xl font-black text-zinc-300">{profile?.experience || 0} Years</span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Users className="text-yellow-400 w-5 h-5" /> Squad Board
              </h3>
              <button onClick={() => router.push("/coach/squad")} className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors">
                Manage Squad <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {team.length === 0 ? (
              <div className="text-center py-10 text-zinc-550 text-xs">
                No squad players found in this state or club.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.slice(0, 3).map((p) => (
                  <div key={p._id} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-850 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                      <img src={p.profilePhoto} alt="Player" className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate flex-1">
                      <h4 className="text-white font-bold text-xs truncate flex items-center gap-1">
                        {p.name}
                        {p.verifiedBadge && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                      </h4>
                      <p className="text-[10px] text-zinc-550 uppercase tracking-widest mt-0.5">
                        Pos: {p.preferredPosition} | rating: {p.skills?.aiScore || 60}
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
