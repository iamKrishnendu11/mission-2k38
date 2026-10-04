"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, Star, Calendar, MessageSquare, ShieldCheck, 
  MapPin, X, ArrowRight, UserPlus, Sliders, CheckCircle2 
} from "lucide-react";
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
      <div className="max-w-7xl mx-auto space-y-8 relative">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-850 pb-4">
          <div>
            <h2 className="text-3xl font-black uppercase text-white tracking-wider">
              Talent Search Engine
            </h2>
            <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold">
              Filter through state registered sub-junior academy players
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS TOOLBAR */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4.5 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                name="queryText"
                placeholder="Search players by name..."
                value={filters.queryText}
                onChange={handleFilterChange}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-400 focus:outline-none rounded-xl py-4 pl-12 pr-4 text-sm text-white"
              />
            </div>
            <button
              onClick={executeSearch}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase tracking-wider px-8 rounded-xl text-xs transition-all shrink-0"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 border-t border-zinc-850 pt-6">
            <div>
              <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">State</label>
              <input type="text" name="state" placeholder="Delhi" value={filters.state} onChange={handleFilterChange}
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-white" />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Position</label>
              <input type="text" name="position" placeholder="CF" value={filters.position} onChange={handleFilterChange}
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-white" />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Min Age</label>
              <input type="number" name="minAge" value={filters.minAge} onChange={handleFilterChange}
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-white" />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Max Age</label>
              <input type="number" name="maxAge" value={filters.maxAge} onChange={handleFilterChange}
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-white" />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Min AI Score</label>
              <input type="number" name="minAiScore" placeholder="60" value={filters.minAiScore} onChange={handleFilterChange}
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-white" />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                <input type="checkbox" name="verifiedOnly" checked={filters.verifiedOnly} onChange={handleFilterChange}
                  className="rounded border-zinc-800 bg-zinc-950 text-yellow-400 focus:ring-yellow-400" />
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
          <div className="p-12 bg-zinc-900/20 border border-zinc-805 rounded-3xl text-center text-zinc-500 text-xs">
            No talent cards matched your query. Adjust criteria range parameters!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map((player) => (
              <div 
                key={player._id} 
                onClick={() => setSelectedPlayer(player)}
                className="bg-zinc-900/40 border border-zinc-800 hover:border-yellow-400/40 rounded-2xl p-6 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0 flex items-center justify-center">
                      {player.profilePhoto ? (
                        <img src={player.profilePhoto} alt="Player" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black uppercase text-yellow-400">
                          {(player.name || "P").charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    {/* FUT Score */}
                    <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-850 text-center shrink-0">
                      <span className="block text-[8px] uppercase font-black text-zinc-500 font-mono">Score</span>
                      <span className="text-sm font-black text-yellow-400">
                        {(player.skills?.scoutRatingsCount || 0) > 0 ? (player.skills?.aiScore || player.skills?.scoutScore || 0) : 0}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-white font-bold text-sm truncate flex items-center gap-1">
                    {player.name}
                    {player.verifiedBadge && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                  </h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                    Pos: {player.preferredPosition} • Foot: {player.dominantFoot}
                  </p>
                </div>

                <div className="mt-6 border-t border-zinc-850 pt-4 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase">
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
