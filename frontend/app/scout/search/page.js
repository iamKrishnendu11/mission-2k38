"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, Star, Calendar, MessageSquare, ShieldCheck, 
  MapPin, X, ArrowRight, UserPlus, Sliders, CheckCircle2, User 
} from "lucide-react";
import { SlidingButton } from "@/app/login/components/SlidingButton";
import PlayerInspectModal from "@/components/PlayerInspectModal";

export default function ScoutSearch() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    state: "",
    position: "",
    minHeight: "",
    maxHeight: "",
    minAge: "",
    maxAge: "",
    minSpeed: "",
    minDribbling: "",
    minPassing: "",
    minAiScore: "",
    verifiedOnly: false,
    queryText: ""
  });

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showTrialForm, setShowTrialForm] = useState(false);
  const [trialDetails, setTrialDetails] = useState({
    date: "",
    time: "",
    location: "",
    notes: ""
  });
  
  const [savedStatus, setSavedStatus] = useState({});
  const [submittingTrial, setSubmittingTrial] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState(false);

  useEffect(() => {
    executeSearch();
    api.get("/dashboard/scout/dashboard")
      .then(res => {
        const savedMap = {};
        (res.savedPlayers || []).forEach(p => {
          const uId = p.user?._id || p.user || p._id;
          savedMap[uId] = true;
          if (p._id) savedMap[p._id] = true;
        });
        setSavedStatus(savedMap);
      })
      .catch(err => console.error(err));
  }, []);

  const executeSearch = () => {
    setLoading(true);
    api.post("/dashboard/scout/search", filters)
      .then(res => {
        setPlayers(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSaveToggle = async (playerObj) => {
    try {
      const pId = typeof playerObj === 'object'
        ? (playerObj.user?._id || playerObj.user?.id || playerObj.user || playerObj._id)
        : playerObj;
      const profileId = typeof playerObj === 'object' ? playerObj._id : playerObj;

      const res = await api.post("/dashboard/scout/save", { playerId: pId });
      setSavedStatus(prev => ({
        ...prev,
        [pId]: res.saved,
        [profileId]: res.saved
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleTrial = async (e) => {
    e.preventDefault();
    if (!selectedPlayer || !trialDetails.date || !trialDetails.location) return;
    setSubmittingTrial(true);
    setTrialSuccess(false);

    try {
      await api.post("/dashboard/scout/trial", {
        playerId: selectedPlayer.user._id,
        ...trialDetails
      });
      setTrialSuccess(true);
      setTimeout(() => {
        setShowTrialForm(false);
        setTrialSuccess(false);
        setTrialDetails({ date: "", time: "", location: "", notes: "" });
      }, 1500);
    } catch (err) {
      alert("Trial scheduling failed: " + err.message);
    } finally {
      setSubmittingTrial(false);
    }
  };

  const handleStartChat = async (targetUserId) => {
    try {
      const chat = await api.post("/social/chats/start", { targetUserId });
      // Redirect to messages page (scout messages route can be loaded)
      router.push(`/scout/messages?chatId=${chat._id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 relative px-4 md:px-0">
        <div className="flex justify-between items-center mb-4 border-b border-white/[0.04] pb-6 pt-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Search className="w-6 h-6 text-yellow-400 drop-shadow-md" /> Talent Search Engine
            </h2>
            <p className="text-white/50 text-sm mt-1 font-medium">
              Filter through state registered sub-junior academy players
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS TOOLBAR */}
        <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[32px] p-8 md:p-10 backdrop-blur-xl space-y-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                name="queryText"
                placeholder="Search players by name..."
                value={filters.queryText}
                onChange={handleFilterChange}
                className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-[20px] py-4 pl-14 pr-4 text-sm text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              />
            </div>
            <SlidingButton
              onClick={executeSearch}
              className="h-14 px-10 font-black uppercase tracking-widest text-sm w-full md:w-auto"
            >
              Search
            </SlidingButton>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 border-t border-white/[0.04] pt-8">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">State</label>
              <input type="text" name="state" placeholder="Delhi" value={filters.state} onChange={handleFilterChange}
                className="w-full bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-3 text-sm text-white focus:border-yellow-400/50 focus:outline-none" />
            </div>
            
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Position</label>
              <input type="text" name="position" placeholder="CF" value={filters.position} onChange={handleFilterChange}
                className="w-full bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-3 text-sm text-white focus:border-yellow-400/50 focus:outline-none" />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Min Age</label>
              <input type="number" name="minAge" value={filters.minAge} onChange={handleFilterChange}
                className="w-full bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-3 text-sm text-white focus:border-yellow-400/50 focus:outline-none" />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Max Age</label>
              <input type="number" name="maxAge" value={filters.maxAge} onChange={handleFilterChange}
                className="w-full bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-3 text-sm text-white focus:border-yellow-400/50 focus:outline-none" />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Min AI Score</label>
              <input type="number" name="minAiScore" placeholder="60" value={filters.minAiScore} onChange={handleFilterChange}
                className="w-full bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-3 text-sm text-white focus:border-yellow-400/50 focus:outline-none" />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-white/50 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" name="verifiedOnly" checked={filters.verifiedOnly} onChange={handleFilterChange}
                  className="rounded border-white/[0.1] bg-[#0a0a0c] text-yellow-400 focus:ring-yellow-400 focus:ring-offset-0 w-5 h-5" />
                <span>Verified Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-zinc-550 uppercase tracking-widest font-bold">Scanning database...</span>
          </div>
        ) : players.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-white/20" />
            </div>
            <h4 className="text-sm font-bold text-white/70 mb-1">No Players Found</h4>
            <p className="text-xs font-medium text-white/40 max-w-sm">No talent cards matched your query. Adjust criteria range parameters!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map((player) => (
              <div 
                key={player._id} 
                onClick={() => setSelectedPlayer(player)}
                className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-yellow-400/40 rounded-[24px] p-6 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-white/[0.05] bg-white/[0.02] shrink-0 flex items-center justify-center">
                      {player.profilePhoto && !player.profilePhoto.includes("undefined") && !player.profilePhoto.includes("null") ? (
                        <img src={player.profilePhoto} alt="Player" className="w-full h-full object-cover group-hover:scale-110 transition-transform" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <User className="w-6 h-6 text-white/20" />
                      )}
                    </div>
                    
                    {/* FUT Score */}
                    <div className="bg-[#0a0a0c] px-3 py-1.5 rounded-xl border border-white/[0.04] text-center shrink-0">
                      <span className="block text-[9px] uppercase font-bold tracking-widest text-white/40">AI Score</span>
                      <span className="text-sm font-black text-yellow-400">
                        {(player.skills?.scoutRatingsCount || 0) > 0 ? (player.skills?.aiScore || player.skills?.scoutScore || 0) : 0}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-white font-bold text-base truncate flex items-center gap-1.5">
                    {player.name}
                    {player.verifiedBadge && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                  </h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                    Pos: <span className="text-white/70">{player.preferredPosition}</span> • Foot: <span className="text-white/70">{player.dominantFoot}</span>
                  </p>
                </div>

                <div className="mt-6 border-t border-white/[0.04] pt-5 flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  <span>{player.city}, {player.state}</span>
                  <span className="text-yellow-400">
                    Potential: {(player.skills?.scoutRatingsCount || 0) > 0 ? (player.skills?.potential || 0) : 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FULL PLAYER CARD & DOSSIER INSPECT MODAL */}
        {selectedPlayer && (
          <PlayerInspectModal
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
            onSaveToggle={() => handleSaveToggle(selectedPlayer)}
            isSaved={Boolean(savedStatus[selectedPlayer.user?._id] || savedStatus[selectedPlayer._id])}
            onStartChat={selectedPlayer.user?._id ? () => handleStartChat(selectedPlayer.user._id) : null}
            onScheduleTrial={async (trialData) => {
              await api.post("/dashboard/scout/trial", {
                playerId: selectedPlayer.user?._id || selectedPlayer.user,
                ...trialData
              });
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
