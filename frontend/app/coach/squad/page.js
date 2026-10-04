"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Search, MessageSquare, ShieldCheck } from "lucide-react";

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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-850 pb-4">
          <div>
            <h2 className="text-3xl font-black uppercase text-white tracking-wider">Squad Board</h2>
            <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold font-sans">
              Manage and communicate with players under your direct development bracket
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-4.5 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search players by name or position..."
            value={queryText}
            onChange={e => setQueryText(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl py-4 pl-12 pr-4 text-xs text-white"
          />
        </div>

        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-zinc-550 uppercase tracking-widest font-bold font-sans">Loading Squad...</span>
          </div>
        ) : filteredSquad.length === 0 ? (
          <div className="p-12 bg-zinc-900/35 border border-zinc-800 rounded-3xl text-center text-zinc-500 text-xs">
            No matching players found in your squad list.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSquad.map((p) => (
              <div key={p._id} className="bg-zinc-905 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0">
                      <img src={p.profilePhoto} alt="Player" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-850 text-center shrink-0">
                      <span className="block text-[8px] uppercase font-black text-zinc-500">AI</span>
                      <span className="text-sm font-black text-yellow-400">{p.skills?.aiScore || 60}</span>
                    </div>
                  </div>

                  <h4 className="text-white font-bold text-sm truncate flex items-center gap-1">
                    {p.name}
                    {p.verifiedBadge && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                  </h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                    Pos: {p.preferredPosition} | Foot: {p.dominantFoot}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-850 flex gap-4">
                  <button
                    onClick={() => handleStartChat(p.user?._id || p.user)}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-yellow-400 font-bold uppercase tracking-wider py-3 rounded-xl border border-zinc-805 text-[10px] transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
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
