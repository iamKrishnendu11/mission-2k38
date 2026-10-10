"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import PlayerInspectModal from "@/components/PlayerInspectModal";
import { Star, MessageSquare, ShieldCheck, MapPin, Trash2, Calendar, User } from "lucide-react";
import { SlidingButton } from "@/app/login/components/SlidingButton";

export default function ScoutSavedPlayers() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectingPlayer, setInspectingPlayer] = useState(null);

  useEffect(() => {
    loadSavedPlayers();
  }, []);

  const loadSavedPlayers = () => {
    setLoading(true);
    api.get("/dashboard/scout/dashboard")
      .then(res => {
        setPlayers(res.savedPlayers || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleStartChat = async (targetUserId) => {
    try {
      const chat = await api.post("/social/chats/start", { targetUserId });
      router.push(`/scout/messages?chatId=${chat._id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnsavePlayer = async (rawId) => {
    try {
      await api.post("/dashboard/scout/save", { playerId: rawId });
      if (inspectingPlayer && (inspectingPlayer._id === rawId || inspectingPlayer.user === rawId || inspectingPlayer.user?._id === rawId)) {
        setInspectingPlayer(null);
      }
      loadSavedPlayers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.04] pb-6 pt-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Saved Prospects
            </h2>
            <p className="text-white/50 text-sm mt-1 font-medium">
              Bookmarked talent pool for evaluation and trial invitations
            </p>
          </div>
          <SlidingButton
            onClick={() => router.push("/scout/search")}
            className="h-14 px-8 font-black uppercase tracking-widest text-sm"
          >
            + Find More Talent
          </SlidingButton>
        </div>

        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Loading Saved Prospects...</span>
          </div>
        ) : players.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[32px]">
            <div className="w-14 h-14 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-white/20" />
            </div>
            <h4 className="text-sm font-bold text-white/70 mb-1">No Saved Profiles</h4>
            <p className="text-xs font-medium text-white/40 max-w-sm mb-6">You haven't saved any player profiles yet. Use the Talent Search to bookmark prospects!</p>
            <SlidingButton
              onClick={() => router.push("/scout/search")}
              className="h-12 px-6 font-black uppercase tracking-widest text-[11px]"
            >
              Go to Talent Search
            </SlidingButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map((p) => {
              const uId = p.user?._id || p.user || p._id;
              return (
                <div key={p._id} className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-yellow-400/40 rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden group transition-all">
                  {/* Clickable Header & Details */}
                  <div className="cursor-pointer" onClick={() => setInspectingPlayer(p)}>
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-white/[0.05] bg-white/[0.02] shrink-0 group-hover:scale-110 transition-transform flex items-center justify-center">
                        {p.profilePhoto && !p.profilePhoto.includes("undefined") && !p.profilePhoto.includes("null") ? (
                          <img src={p.profilePhoto} alt="Player" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <User className="w-6 h-6 text-white/20" />
                        )}
                      </div>
                      <div className="bg-[#0a0a0c] px-3 py-1.5 rounded-xl border border-white/[0.04] text-center shrink-0">
                        <span className="block text-[9px] uppercase font-bold tracking-widest text-white/40">AI Score</span>
                        <span className="text-sm font-black text-yellow-400">
                          {(p.skills?.scoutRatingsCount || 0) > 0 ? (p.skills?.aiScore || p.skills?.scoutScore || 0) : 0}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-white font-bold text-base truncate flex items-center gap-1.5 group-hover:text-yellow-400 transition-colors">
                      {p.name}
                      {p.verifiedBadge && <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                    </h4>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                      <span className="text-white/70">{p.preferredPosition}</span> • <span className="text-white/70">{p.ageCategory || "Senior"}</span>
                    </p>
                    {(p.city || p.state) && (
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-white/30" />
                        {[p.city, p.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/[0.04] flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartChat(uId)}
                        className="flex-1 bg-[#0a0a0c] hover:bg-white/[0.02] text-yellow-400 font-bold uppercase tracking-wider py-2.5 rounded-xl border border-white/[0.04] text-[10px] transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </button>
                      <button
                        onClick={() => setInspectingPlayer(p)}
                        className="flex-1 bg-yellow-400 text-black font-black uppercase tracking-wider py-2.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 hover:scale-105 shadow-md"
                      >
                        Inspect
                      </button>
                    </div>

                    <button
                      onClick={() => handleUnsavePlayer(uId)}
                      className="w-full text-white/40 hover:text-red-400 text-[10px] font-bold uppercase py-1 mt-1 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Remove from Saved
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FULL PLAYER CARD & DOSSIER INSPECT MODAL */}
        {inspectingPlayer && (
          <PlayerInspectModal
            player={inspectingPlayer}
            onClose={() => setInspectingPlayer(null)}
            onSaveToggle={() => handleUnsavePlayer(inspectingPlayer.user?._id || inspectingPlayer.user || inspectingPlayer._id)}
            isSaved={true}
            onStartChat={inspectingPlayer.user?._id || inspectingPlayer.user ? () => handleStartChat(inspectingPlayer.user?._id || inspectingPlayer.user) : null}
            onScheduleTrial={async (trialData) => {
              await api.post("/dashboard/scout/trial", {
                playerId: inspectingPlayer.user?._id || inspectingPlayer.user || inspectingPlayer._id,
                ...trialData
              });
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
