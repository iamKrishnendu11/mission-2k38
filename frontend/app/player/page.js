"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, Video, Calendar, ArrowRight, Activity, Users, Star } from "lucide-react";

export default function PlayerDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rankInfo, setRankInfo] = useState(null);

  useEffect(() => {
    loadDashboard();
    api.get("/dashboard/leaderboard")
      .then(res => {
        setRankInfo({
          rank: res.myRank || 1,
          total: res.totalPlayers || 1,
          myData: res.myData
        });
      })
      .catch(err => console.error(err));
  }, []);

  const loadDashboard = () => {
    setLoading(true);
    api.get("/dashboard/player/dashboard")
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load player stats.");
        setLoading(false);
      });
  };

  const handleApplyTrial = async (trialId) => {
    try {
      await api.post(`/trials/${trialId}/apply`);
      loadDashboard();
    } catch (err) {
      console.error("Error accepting trial:", err);
    }
  };

  const handleDeclineTrial = async (trialId) => {
    try {
      await api.post(`/trials/${trialId}/decline`);
      loadDashboard();
    } catch (err) {
      console.error("Error declining trial:", err);
    }
  };

  const getScoutDisplayName = (trial) => {
    if (trial.scoutName && trial.scoutName !== 'Scout' && trial.scoutName !== 'Scout Organizer') {
      return trial.scoutName;
    }
    const rawEmail = trial.scout?.email || (typeof trial.scout === 'string' ? trial.scout : '');
    if (rawEmail && rawEmail.includes('@')) {
      const username = rawEmail.split('@')[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return trial.scoutName || "Scout Organizer";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm tracking-widest font-bold uppercase">Loading Player Stats...</p>
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

  const { profile, videos, analyses, trials, tournaments } = data;
  const recentAnalysis = analyses && analyses[0];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* BANNER SECTION */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-zinc-800 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(circle_at_right_bottom,rgba(250,204,21,0.08),transparent_60%)] pointer-events-none" />
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className="bg-yellow-400/10 text-yellow-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-yellow-400/20">
                Active Pitch
              </span>
              {profile?.verifiedBadge && (
                <span className="bg-blue-500/10 text-blue-400 text-xs font-bold uppercase px-3 py-1 rounded-full border border-blue-500/20">
                  Verified Scout Badge
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none uppercase">
              Welcome back, <span className="text-yellow-400">{profile?.name}</span>
            </h1>
            <p className="text-zinc-400 mt-3 max-w-xl text-sm leading-relaxed">
              Analyze your matches, review custom AI-coaching drills, and stay ready to showcase your skills to scouts across the country.
            </p>
          </div>
          {/* YOUR RANK BANNER CARD WITH GLOBAL LEADERBOARD HEADER LINK */}
          <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => router.push("/player/leaderboard")}
              className="text-xs font-black uppercase tracking-widest text-yellow-400 hover:text-white transition-colors flex items-center gap-1.5 group bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/30 hover:border-yellow-400 shadow-md"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span>Global Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div 
              onClick={() => router.push("/player/leaderboard")}
              className="w-full md:w-auto bg-zinc-900/90 border-2 border-yellow-400/40 hover:border-yellow-400 rounded-2xl p-4 md:p-5 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-all shadow-xl backdrop-blur-md"
              title="Click to view Global Leaderboard"
            >
              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-yellow-400 to-amber-600 text-black font-black p-3 rounded-xl min-w-[75px] shadow-lg">
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-80">YOUR RANK</span>
                <span className="text-2xl leading-none font-black mt-0.5">#{rankInfo?.rank || 1}</span>
                <span className="text-[8px] font-bold opacity-75">OF {rankInfo?.total || 14}</span>
              </div>
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{profile?.name}</h4>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                    {profile?.preferredPosition || 'CAM'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  {profile?.currentClub || 'FC Barcelona'} • Overall Score: <strong className="text-yellow-400 font-bold">{rankInfo?.myData ? rankInfo.myData.overallScore : (profile?.skills?.scoutRatingsCount > 0 ? (profile?.skills?.scoutScore || 0) : 0)}</strong>
                </p>
                <div className="flex items-center gap-1.5 text-[9px] text-green-400 font-semibold pt-0.5">
                  <span className="text-amber-400">🔥</span>
                  <span>Top {Math.max(1, Math.round(((rankInfo?.rank || 1) / (rankInfo?.total || 14)) * 100))}% Global Standing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Matches", value: profile?.matchesPlayed || 0, color: "text-zinc-300" },
            { label: "Goals", value: profile?.goals || 0, color: "text-yellow-400" },
            { label: "Assists", value: profile?.assists || 0, color: "text-amber-400" },
            { label: "Clean Sheets", value: profile?.cleanSheets || 0, color: "text-zinc-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
              <span className="block text-[11px] uppercase tracking-widest text-zinc-500 font-bold mb-2">{stat.label}</span>
              <span className={`text-4xl md:text-5xl font-black ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* DETAILS SECTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: AI ANALYSIS HIGHLIGHT */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-md font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <Activity className="text-yellow-400 w-5 h-5" /> Recent AI Coaching Report
                  </h3>
                  <span className="text-[10px] text-zinc-500">FastAPI MediaPipe & YOLO Analysis Engine</span>
                </div>
                <button onClick={() => router.push("/player/analytics")} className="text-yellow-400 text-xs uppercase font-bold tracking-widest hover:text-white flex items-center gap-1 transition-colors">
                  View Analytics <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {recentAnalysis ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Drill Mode</span>
                      <h4 className="text-white font-black uppercase text-lg">{recentAnalysis.drillType} Coaching</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Analysis Date</span>
                      <h4 className="text-zinc-300 font-semibold text-sm">{new Date(recentAnalysis.createdAt).toLocaleDateString()}</h4>
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
                    <h5 className="text-xs uppercase font-bold tracking-widest text-yellow-400/90 mb-3">AI Verdict & Action Plan</h5>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                      {recentAnalysis.report?.substring(0, 320)}...
                    </p>
                  </div>

                  <button 
                    onClick={() => router.push("/player/coach")} 
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl py-3 text-xs uppercase font-bold tracking-widest transition-all"
                  >
                    Open AI Training Terminal
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <Video className="w-12 h-12 text-zinc-700 mx-auto" />
                  <div>
                    <h4 className="text-white font-bold">No Training Videos Analyzed Yet</h4>
                    <p className="text-zinc-500 text-xs mt-1">Upload a shooting, dribbling, or keeper video to get AI ratings feedback.</p>
                  </div>
                  <button onClick={() => router.push("/player/upload")} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-yellow-400 font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-full transition-all">
                    Upload Video
                  </button>
                </div>
              )}
            </div>

            {/* UPCOMING TRIALS & INVITES CARD */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h3 className="text-md font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <Calendar className="text-yellow-400 w-5 h-5" /> Invites & Trial Schedules
                </h3>
                <button
                  onClick={() => router.push('/player/tournaments')}
                  className="text-yellow-400 text-xs font-bold uppercase tracking-widest hover:underline"
                >
                  View All Board →
                </button>
              </div>

              {trials && trials.length > 0 ? (
                <div className="space-y-4">
                  {trials.map((trial) => {
                    const isAccepted = trial.myStatus === "accepted";
                    const isRegistered = trial.isRegistered;
                    const scoutDisplayName = getScoutDisplayName(trial);

                    return (
                      <div key={trial._id} className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                        <div className="space-y-1 truncate">
                          <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded border inline-block ${
                            isAccepted
                              ? "bg-green-500/20 text-green-400 border-green-500/40"
                              : trial.privacy === "private"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                              : "bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
                          }`}>
                            {isAccepted ? "ACCEPTED ✓" : trial.privacy === "private" ? "🔒 PRIVATE INVITATION" : "📢 PUBLIC TRIAL"}
                          </span>
                          <h4 className="text-white font-bold text-md uppercase truncate">{trial.title || `Trial at ${trial.location}`}</h4>
                          <p className="text-xs text-zinc-400">Venue: {trial.location}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            Organized by: <span className="text-zinc-300 font-black">{scoutDisplayName}</span> {trial.scoutOrganization ? `(${trial.scoutOrganization})` : ""}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 w-full md:w-auto justify-between">
                          <div className="bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 text-center">
                            <span className="block text-xs font-black text-white">{new Date(trial.date).toLocaleDateString()}</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">{trial.time}</span>
                          </div>

                          {!isRegistered ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApplyTrial(trial._id)}
                                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase text-[10px] tracking-wider px-3.5 py-2 rounded-xl hover:scale-105 transition-all shadow-md"
                              >
                                {trial.privacy === "private" ? "Accept Invite" : "Apply"}
                              </button>
                              <button
                                onClick={() => handleDeclineTrial(trial._id)}
                                className="bg-zinc-900 text-red-400 border border-red-500/40 font-bold uppercase text-[10px] tracking-wider px-3.5 py-2 rounded-xl hover:bg-red-500/10 transition-all"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
                              isAccepted ? "bg-green-500/20 text-green-400 border-green-500/40" : "bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
                            }`}>
                              {isAccepted ? "CONFIRMED ✓" : "SUBMITTED • PENDING"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No active trial invitations or schedules. Build up your AI score to catch scout attention!
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: OVERALL PROFILE CARD SUMMARY */}
          <div className="space-y-8">
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-amber-500" />
              
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-yellow-400/40 mx-auto mt-4 mb-4 bg-zinc-850 flex items-center justify-center">
                {profile?.profilePhoto ? (
                  <img 
                    src={profile.profilePhoto} 
                    alt="Player Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-4xl font-black uppercase text-yellow-400">
                    {profile?.name ? profile.name.charAt(0) : "U"}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black uppercase text-white">{profile?.name}</h3>
              <p className="text-zinc-400 text-xs mt-1 uppercase font-bold tracking-wider">{profile?.preferredPosition} • {profile?.currentClub || "Free Agent"}</p>

              {/* Skill stats radar ratings mockup */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {(() => {
                  const isRated = (profile?.skills?.scoutRatingsCount || 0) > 0;
                  return [
                    { label: "Overall", val: isRated ? (profile?.skills?.scoutScore || profile?.skills?.overallScore || 0) : 0 },
                    { label: "Speed", val: isRated ? (profile?.skills?.speed || 0) : 0 },
                    { label: "Passing", val: isRated ? (profile?.skills?.passing || 0) : 0 },
                    { label: "Dribbling", val: isRated ? (profile?.skills?.dribbling || 0) : 0 },
                    { label: "Finishing", val: isRated ? (profile?.skills?.finishing || profile?.skills?.shooting || 0) : 0 },
                    { label: "Potential", val: isRated ? (profile?.skills?.potential || 0) : 0 },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900 text-left">
                      <span className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold">{s.label}</span>
                      <span className="text-lg font-black text-white">{s.val}</span>
                    </div>
                  ));
                })()}
              </div>

              <button 
                onClick={() => router.push("/player/profile")} 
                className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-widest py-3.5 rounded-xl shadow-md text-xs hover:scale-[1.02] transition-all"
              >
                Inspect Player Card
              </button>
            </div>

            {/* TOURNAMENT HIGHLIGHT */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Nearby Active Leagues</h3>
              <div className="space-y-4">
                {tournaments && tournaments.slice(0, 2).map((t) => (
                  <div key={t._id} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-bold text-xs">{t.name}</h4>
                      <span className="text-[10px] text-zinc-500">{t.location}</span>
                    </div>
                    <button onClick={() => router.push("/player/tournaments")} className="p-2 bg-zinc-900 rounded-full hover:bg-yellow-400 hover:text-black border border-zinc-800 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
