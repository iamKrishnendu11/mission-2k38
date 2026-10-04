"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import PlayerInspectModal from "@/components/PlayerInspectModal";
import { Trophy, Award, Medal, Crown, Star, Flame, Shield, Search, Eye, Filter, ArrowUpRight } from "lucide-react";

export default function GlobalLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [myData, setMyData] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectingPlayer, setInspectingPlayer] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = () => {
    setLoading(true);
    api.get("/dashboard/leaderboard")
      .then(res => {
        setLeaderboardData(res.top10 || []);
        setMyRank(res.myRank || null);
        setMyData(res.myData || null);
        setTotalPlayers(res.totalPlayers || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Leaderboard fetch error:", err);
        setLoading(false);
      });
  };

  const inspectPlayer = (rawPId) => {
    if (!rawPId) return;
    const pId = typeof rawPId === 'object' ? (rawPId._id || rawPId.user) : rawPId;
    api.get(`/dashboard/profile/${pId}`)
      .then(res => {
        setInspectingPlayer(res.profile || res);
      })
      .catch(err => console.error(err));
  };

  // Filter players by position & search query
  const filteredLeaderboard = (leaderboardData || []).filter(player => {
    if (!player) return false;
    const pName = (player.name || "").toLowerCase();
    const pClub = (player.currentClub || "").toLowerCase();
    const query = (searchQuery || "").toLowerCase();

    const matchesSearch = pName.includes(query) || pClub.includes(query);
    const pos = (player.preferredPosition || "ST").toUpperCase();
    
    if (positionFilter === "ALL") return matchesSearch;
    if (positionFilter === "FWD") return matchesSearch && ["ST", "LW", "RW"].includes(pos);
    if (positionFilter === "MID") return matchesSearch && ["CAM", "CM", "CDM"].includes(pos);
    if (positionFilter === "DEF") return matchesSearch && ["CB", "LB", "RB", "WB"].includes(pos);
    if (positionFilter === "GK") return matchesSearch && pos === "GK";
    return matchesSearch;
  });

  const rank1 = leaderboardData[0];
  const rank2 = leaderboardData[1];
  const rank3 = leaderboardData[2];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12 select-none">
        
        {/* HEADER & MY RANK HERO BANNER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 md:p-8 rounded-3xl border border-zinc-800/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-black uppercase tracking-widest">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official FIFA-Style Leaderboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
              GLOBAL <span className="text-yellow-400">PLAYER RANKINGS</span>
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              Top 10 grassroots football talents calculated using AI biomechanics evaluations, scout ratings, and tactical position weightings.
            </p>
          </div>

          {/* LOGGED IN PLAYER RANK BANNER */}
          {myData && (
            <div className="w-full lg:w-auto bg-zinc-900/90 border-2 border-yellow-400/40 rounded-2xl p-5 flex items-center gap-5 z-10 shadow-xl backdrop-blur-md">
              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-yellow-400 to-amber-600 text-black font-black p-3.5 rounded-xl min-w-[75px] shadow-lg">
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-80">YOUR RANK</span>
                <span className="text-2xl leading-none font-black mt-0.5">#{myRank || 1}</span>
                <span className="text-[8px] font-bold opacity-75">OF {totalPlayers}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{myData.name}</h4>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                    {myData.preferredPosition}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">{myData.currentClub} • Overall Score: <strong className="text-yellow-400 font-bold">{myData.overallScore}</strong></p>
                <div className="flex items-center gap-1.5 text-[9px] text-green-400 font-semibold pt-0.5">
                  <Flame className="w-3 h-3 text-amber-400 animate-bounce" />
                  <span>Top {Math.max(1, Math.round(((myRank || 1) / (totalPlayers || 1)) * 100))}% Global Standing</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TOP 3 PODIUM DISPLAY */}
        {!loading && leaderboardData.length >= 3 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>Global Podium Winners</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* SILVER - RANK 2 */}
              {rank2 && (
                <div 
                  onClick={() => inspectPlayer(rank2.user)}
                  className="bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950 border border-zinc-700/60 hover:border-slate-300 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-300 text-black text-[10px] font-black uppercase tracking-wider rounded-bl-2xl flex items-center gap-1 shadow-md">
                    <Medal className="w-3.5 h-3.5" />
                    <span>RANK #2</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-slate-300 overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        <img src={rank2.profilePhoto} alt={rank2.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white group-hover:text-slate-300 transition-colors">{rank2.name}</h4>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">{rank2.preferredPosition} • {rank2.currentClub}</span>
                        <span className="text-[10px] font-black text-slate-300 mt-1 inline-block bg-slate-400/10 px-2 py-0.5 rounded border border-slate-300/30">
                          {rank2.overallScore} OVERALL
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-zinc-800/80 text-[10px]">
                      <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[8px] font-bold uppercase">PAC</span>
                        <span className="font-bold text-white">{rank2.skills.speed}</span>
                      </div>
                      <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[8px] font-bold uppercase">PAS</span>
                        <span className="font-bold text-white">{rank2.skills.passing}</span>
                      </div>
                      <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[8px] font-bold uppercase">DRI</span>
                        <span className="font-bold text-white">{rank2.skills.dribbling}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GOLD - RANK 1 */}
              {rank1 && (
                <div 
                  onClick={() => inspectPlayer(rank1.user)}
                  className="bg-gradient-to-b from-yellow-500/20 via-zinc-900 to-zinc-950 border-2 border-yellow-400 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.04] shadow-[0_0_35px_rgba(250,204,21,0.25)] relative group overflow-hidden md:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider rounded-bl-2xl flex items-center gap-1 shadow-lg">
                    <Crown className="w-4 h-4 text-black animate-pulse" />
                    <span>WORLD #1</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-zinc-800 border-4 border-yellow-400 overflow-hidden shrink-0 shadow-2xl group-hover:scale-105 transition-transform">
                        <img src={rank1.profilePhoto} alt={rank1.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400" /> LEADER
                        </span>
                        <h4 className="font-bold text-lg text-white group-hover:text-yellow-400 transition-colors">{rank1.name}</h4>
                        <span className="text-[10px] uppercase font-bold text-zinc-300 block">{rank1.preferredPosition} • {rank1.currentClub}</span>
                        <span className="text-xs font-black text-black bg-yellow-400 px-2.5 py-0.5 rounded-lg mt-1 inline-block shadow-md">
                          {rank1.overallScore} RATING
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-yellow-400/20 text-[10px]">
                      <div className="bg-zinc-950/90 p-2 rounded-xl border border-yellow-400/30">
                        <span className="text-yellow-400 block text-[8px] font-bold uppercase">PAC</span>
                        <span className="font-bold text-white">{rank1.skills.speed}</span>
                      </div>
                      <div className="bg-zinc-950/90 p-2 rounded-xl border border-yellow-400/30">
                        <span className="text-yellow-400 block text-[8px] font-bold uppercase">PAS</span>
                        <span className="font-bold text-white">{rank1.skills.passing}</span>
                      </div>
                      <div className="bg-zinc-950/90 p-2 rounded-xl border border-yellow-400/30">
                        <span className="text-yellow-400 block text-[8px] font-bold uppercase">DRI</span>
                        <span className="font-bold text-white">{rank1.skills.dribbling}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BRONZE - RANK 3 */}
              {rank3 && (
                <div 
                  onClick={() => inspectPlayer(rank3.user)}
                  className="bg-gradient-to-b from-amber-900/30 via-zinc-900/50 to-zinc-950 border border-amber-600/60 hover:border-amber-500 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-bl-2xl flex items-center gap-1 shadow-md">
                    <Award className="w-3.5 h-3.5" />
                    <span>RANK #3</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-amber-600 overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        <img src={rank3.profilePhoto} alt={rank3.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">{rank3.name}</h4>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">{rank3.preferredPosition} • {rank3.currentClub}</span>
                        <span className="text-[10px] font-black text-amber-400 mt-1 inline-block bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          {rank3.overallScore} OVERALL
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-zinc-800/80 text-[10px]">
                      <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[8px] font-bold uppercase">PAC</span>
                        <span className="font-bold text-white">{rank3.skills.speed}</span>
                      </div>
                      <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[8px] font-bold uppercase">PAS</span>
                        <span className="font-bold text-white">{rank3.skills.passing}</span>
                      </div>
                      <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[8px] font-bold uppercase">DRI</span>
                        <span className="font-bold text-white">{rank3.skills.dribbling}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEARCH & POSITION FILTERS */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Position Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "ALL PLAYERS" },
              { id: "FWD", label: "FORWARDS" },
              { id: "MID", label: "MIDFIELDERS" },
              { id: "DEF", label: "DEFENDERS" },
              { id: "GK", label: "GOALKEEPERS" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPositionFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  positionFilter === tab.id
                    ? "bg-yellow-400 text-black shadow-lg"
                    : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by player or club..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* TOP 10 RANKINGS LEADERBOARD TABLE */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-zinc-800/80 bg-zinc-950/40 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Top 10 Global Leaderboard Standings</span>
            </h3>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              Showing {filteredLeaderboard.length} Players
            </span>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Calculating Global Rankings...</span>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              No players found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 font-black uppercase text-[9px] tracking-widest border-b border-zinc-800/80">
                  <tr>
                    <th className="py-4 px-6 text-center">RANK</th>
                    <th className="py-4 px-6">PLAYER</th>
                    <th className="py-4 px-4 text-center">POSITION</th>
                    <th className="py-4 px-6">CLUB & REGION</th>
                    <th className="py-4 px-6 text-center">ATTRIBUTE RATINGS</th>
                    <th className="py-4 px-6 text-center">OVERALL</th>
                    <th className="py-4 px-6 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredLeaderboard.map((player) => {
                    const isTop1 = player.rank === 1;
                    const isTop2 = player.rank === 2;
                    const isTop3 = player.rank === 3;
                    const isMe = myData && player.user.toString() === myData.user.toString();

                    return (
                      <tr 
                        key={player._id || player.rank}
                        className={`transition-colors hover:bg-zinc-900/60 ${
                          isMe ? "bg-yellow-400/10 border-l-4 border-l-yellow-400" : ""
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center justify-center">
                            {isTop1 ? (
                              <span className="w-8 h-8 rounded-full bg-yellow-400 text-black font-black text-xs flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                #1
                              </span>
                            ) : isTop2 ? (
                              <span className="w-8 h-8 rounded-full bg-slate-300 text-black font-black text-xs flex items-center justify-center shadow">
                                #2
                              </span>
                            ) : isTop3 ? (
                              <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow">
                                #3
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-black text-xs">
                                #{player.rank}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Player Profile */}
                        <td className="py-4 px-6">
                          <div 
                            onClick={() => inspectPlayer(player.user)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className={`w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border-2 shrink-0 ${
                              isTop1 ? "border-yellow-400" : isTop2 ? "border-slate-300" : isTop3 ? "border-amber-600" : "border-zinc-700"
                            }`}>
                              <img src={player.profilePhoto} alt={player.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-xs group-hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                                {player.name}
                                {isMe && <span className="text-[9px] font-black uppercase text-yellow-400 bg-yellow-400/20 px-1.5 py-0.2 rounded">(YOU)</span>}
                              </h5>
                              <span className="text-[10px] text-zinc-500 uppercase">{player.ageCategory}</span>
                            </div>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-black text-[10px] uppercase px-2.5 py-1 rounded bg-zinc-950 text-yellow-400 border border-zinc-800">
                            {player.preferredPosition}
                          </span>
                        </td>

                        {/* Club */}
                        <td className="py-4 px-6 text-zinc-300 font-semibold text-xs">
                          <div>{player.currentClub}</div>
                          <span className="text-[10px] text-zinc-500 font-normal">{player.city}</span>
                        </td>

                        {/* Attribute Scores Pills */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1.5 text-[9px]">
                            <span className="bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold" title="Speed">
                              SPD: <strong className="text-white">{player.skills.speed}</strong>
                            </span>
                            <span className="bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold" title="Passing">
                              PAS: <strong className="text-white">{player.skills.passing}</strong>
                            </span>
                            <span className="bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold" title="Dribbling">
                              DRI: <strong className="text-white">{player.skills.dribbling}</strong>
                            </span>
                            <span className="bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold" title="Shooting">
                              SHO: <strong className="text-white">{player.skills.shooting}</strong>
                            </span>
                          </div>
                        </td>

                        {/* Overall Badge */}
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center justify-center font-black text-sm px-3 py-1 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow">
                            {player.overallScore}
                          </div>
                        </td>

                        {/* Action Button */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => inspectPlayer(player.user)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-yellow-400" />
                            <span>Card</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* INSPECT PLAYER MODAL */}
        {inspectingPlayer && (
          <PlayerInspectModal
            player={inspectingPlayer}
            onClose={() => setInspectingPlayer(null)}
          />
        )}

      </div>
    </DashboardLayout>
  );
}
