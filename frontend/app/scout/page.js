"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Calendar, Award, Star, Users, ArrowRight } from "lucide-react";

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
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* HERO */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-zinc-800 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(circle_at_right_bottom,rgba(250,204,21,0.08),transparent_60%)] pointer-events-none" />
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className="bg-yellow-400/10 text-yellow-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-yellow-400/20">
                Agency Board
              </span>
              {profile?.verifiedBadge ? (
                <span className="bg-green-500/10 text-green-400 text-xs font-bold uppercase px-3 py-1 rounded-full border border-green-500/20">
                  Verified Scout Credentials
                </span>
              ) : (
                <span className="bg-zinc-800 text-zinc-500 text-xs font-bold uppercase px-3 py-1 rounded-full border border-zinc-700">
                  Pending Verification
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none uppercase">
              Scout Portal: <span className="text-yellow-400">{profile?.name || "Agent"}</span>
            </h1>
            <p className="text-zinc-400 mt-3 max-w-xl text-sm leading-relaxed">
              Representing <strong className="text-white">{profile?.clubRepresenting || profile?.organization || "Grassroots Academy"}</strong>. Utilize biometric filters to pinpoint elite potential.
            </p>
          </div>
          <button 
            onClick={() => router.push("/scout/search")} 
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-widest px-6 py-4 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all hover:scale-105"
          >
            Launch Player Search →
          </button>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Saved Prospect Lists</span>
            <span className="text-4xl font-black text-yellow-400">{savedPlayers.length} Players</span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Active Scheduled Trials</span>
            <span className="text-4xl font-black text-white">{trials.length} Tryouts</span>
          </div>
          <div className="bg-gradient-to-b from-green-950/30 to-zinc-900/40 border border-green-500/30 rounded-2xl p-6 relative overflow-hidden">
            <span className="block text-[10px] uppercase tracking-widest text-green-400 font-bold mb-2">Confirmed Accepted Prospects</span>
            <span className="text-4xl font-black text-green-400">{acceptedCount} Players</span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Representing Club</span>
            <span className="text-xl font-black text-zinc-300 uppercase truncate block mt-2">{profile?.clubRepresenting || "Grassroots Academy"}</span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TRIALS LIST */}
          <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Calendar className="text-yellow-400 w-5 h-5" /> Trial Calendar Schedule
              </h3>
              <button onClick={() => router.push("/scout/trials")} className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors">
                Full Calendar <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {trials.length === 0 ? (
              <div className="text-center py-10 text-zinc-550 text-xs">
                No trials scheduled. Search players to invite them for tryouts.
              </div>
            ) : (
              <div className="space-y-4">
                {trials.slice(0, 4).map((t) => (
                  <div key={t._id} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-850 flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-bold text-sm">Player: {t.playerProfile?.name || "Academy Prospect"}</h4>
                      <p className="text-xs text-zinc-500">Location: {t.location} | Time: {t.time}</p>
                    </div>
                    <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-center font-bold text-xs shrink-0">
                      {new Date(t.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAVED PLAYERS */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Star className="text-yellow-400 w-5 h-5" /> saved prospects
              </h3>
              <button onClick={() => router.push("/scout/saved")} className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors">
                All Saved <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {savedPlayers.length === 0 ? (
              <div className="text-center py-8 text-zinc-550 text-xs">
                No saved players. Use Search to build list.
              </div>
            ) : (
              <div className="space-y-4">
                {savedPlayers.slice(0, 3).map((p) => (
                  <div key={p._id} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-850 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0 flex items-center justify-center">
                      {p.profilePhoto ? (
                        <img src={p.profilePhoto} alt="Player" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base font-black uppercase text-yellow-400">
                          {(p.name || "P").charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="truncate flex-1">
                      <h4 className="text-white font-bold text-xs truncate">{p.name}</h4>
                      <span className="text-[9px] uppercase tracking-widest text-yellow-400 block mt-0.5">
                        POS: {p.preferredPosition} | Rating: {p.skills?.aiScore || 60}
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
