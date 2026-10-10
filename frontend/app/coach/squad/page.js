"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Search, MessageSquare, ShieldCheck, User } from "lucide-react";

export default function CoachSquad() {
  const router = useRouter();
  const [squad, setSquad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState("");

  useEffect(() => {
    api.get("/dashboard/coach/dashboard")
      .then(res => {
        setSquad(res.team || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleStartChat = async (targetUserId) => {
    try {
      const chat = await api.post("/social/chats/start", { targetUserId });
      router.push(`/coach/messages?chatId=${chat._id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSquad = squad.filter(p => 
    p.name?.toLowerCase().includes(queryText.toLowerCase()) ||
    p.preferredPosition?.toLowerCase().includes(queryText.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0">
        <div className="flex justify-between items-center mb-4 border-b border-white/[0.04] pb-6 pt-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="w-6 h-6 text-yellow-400 drop-shadow-md" /> Squad Board
            </h2>
            <p className="text-white/50 text-sm mt-1 font-medium">
              Manage and communicate with players under your direct development bracket
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search players by name or position..."
            value={queryText}
            onChange={e => setQueryText(e.target.value)}
            className="w-full bg-[#121214] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl py-4 pl-14 pr-4 text-sm text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          />
        </div>

        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-zinc-550 uppercase tracking-widest font-bold font-sans">Loading Squad...</span>
          </div>
        ) : filteredSquad.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white/20" />
            </div>
            <h4 className="text-sm font-bold text-white/70 mb-1">No Players Found</h4>
            <p className="text-xs font-medium text-white/40 max-w-sm">No matching players found in your squad list. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSquad.map((p) => (
              <div key={p._id} className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl hover:border-yellow-400/30 transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-white/[0.05] bg-white/[0.02] shrink-0 flex items-center justify-center">
                      {p.profilePhoto && !p.profilePhoto.includes("undefined") && !p.profilePhoto.includes("null") ? (
                        <img src={p.profilePhoto} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <User className="w-6 h-6 text-white/20" />
                      )}
                    </div>
                    <div className="bg-[#0a0a0c] px-3 py-1.5 rounded-xl border border-white/[0.04] text-center shrink-0">
                      <span className="block text-[9px] uppercase font-bold text-white/40 tracking-widest">AI Rating</span>
                      <span className="text-sm font-black text-yellow-400">{p.skills?.aiScore || 60}</span>
                    </div>
                  </div>

                  <h4 className="text-white font-bold text-base truncate flex items-center gap-1.5">
                    {p.name}
                    {p.verifiedBadge && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                  </h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-bold">
                    Pos: <span className="text-white/70">{p.preferredPosition}</span> | Foot: <span className="text-white/70">{p.dominantFoot}</span>
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.04] flex gap-4">
                  <button
                    onClick={() => handleStartChat(p.user?._id || p.user)}
                    className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] text-white font-bold tracking-tight py-3.5 rounded-xl border border-white/[0.05] text-xs transition-all flex items-center justify-center gap-2 hover:border-white/[0.1]"
                  >
                    <MessageSquare className="w-4 h-4" /> Message Player
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
