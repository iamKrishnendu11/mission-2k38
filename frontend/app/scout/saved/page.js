"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import PlayerInspectModal from "@/components/PlayerInspectModal";
import { Star, MessageSquare, ShieldCheck, MapPin, Trash2, Calendar } from "lucide-react";

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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-850 pb-6">
          <div>
            <h2 className="text-3xl font-black uppercase text-white tracking-wider">Saved Prospects</h2>
            <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold">
              Bookmarked talent pool for evaluation and trial invitations
            </p>
          </div>
          <button
            onClick={() => router.push("/scout/search")}
            className="bg-yellow-400 text-black font-black uppercase text-xs px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-md"
          >
            + Find More Talent
          </button>
        </div>

        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Loading Saved Prospects...</span>
          </div>
        ) : players.length === 0 ? (
          <div className="p-12 bg-zinc-900/35 border border-zinc-800 rounded-3xl text-center text-zinc-500 text-xs space-y-3">
            <p>You haven't saved any player profiles yet. Use the Talent Search to bookmark prospects!</p>
            <button
              onClick={() => router.push("/scout/search")}
              className="text-yellow-400 font-bold uppercase hover:underline"
            >
              Go to Talent Search →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map((p) => {
              const uId = p.user?._id || p.user || p._id;
              return (
                <div key={p._id} className="bg-zinc-900/40 border border-zinc-800 hover:border-yellow-400/60 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all">
                  {/* Clickable Header & Details */}
                  <div className="cursor-pointer" onClick={() => setInspectingPlayer(p)}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0 group-hover:border-yellow-400 transition-all">
                        <img src={p.profilePhoto || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150"} alt="Player" className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-850 text-center shrink-0">
                        <span className="block text-[8px] uppercase font-black text-zinc-500">Score</span>
                        <span className="text-sm font-black text-yellow-400">
                          {(p.skills?.scoutRatingsCount || 0) > 0 ? (p.skills?.aiScore || p.skills?.scoutScore || 0) : 0}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-white font-bold text-base truncate flex items-center gap-1 group-hover:text-yellow-400 transition-colors">
                      {p.name}
                      {p.verifiedBadge && <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                    </h4>
                    <p className="text-[10px] text-yellow-400/90 font-bold uppercase tracking-wider mt-1">
                      {p.preferredPosition} • {p.ageCategory || "Senior"}
                    </p>
                    {(p.city || p.state) && (
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-600" />
                        {[p.city, p.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-850 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartChat(uId)}
                        className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-yellow-400 font-bold uppercase tracking-wider py-2.5 rounded-xl border border-zinc-800 text-[10px] transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </button>
                      <button
                        onClick={() => setInspectingPlayer(p)}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider py-2.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 hover:scale-105"
                      >
                        Inspect Profile
                      </button>
                    </div>

                    <button
                      onClick={() => handleUnsavePlayer(uId)}
                      className="w-full text-zinc-500 hover:text-red-400 text-[10px] font-bold uppercase py-1 flex items-center justify-center gap-1 transition-colors"
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
