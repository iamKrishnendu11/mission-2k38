"use client";

import { useState, useEffect } from "react";
import { api, getSocketUrl } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { MapPin, Trophy, Calendar, Users, Map, CheckCircle2, AlertCircle, Lock, Shield, Clock, Check } from "lucide-react";

import { io as ioClient } from "socket.io-client";

export default function PlayerTournaments() {
  const [activeTab, setActiveTab] = useState("trials"); // 'trials' | 'tournaments'
  const [trials, setTrials] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [gpsSim, setGpsSim] = useState({ name: "Delhi NCR", lat: 28.6139, lng: 77.2090 });

  const locations = [
    { name: "Delhi NCR", lat: 28.6139, lng: 77.2090 },
    { name: "Mumbai Hub", lat: 19.0760, lng: 72.8777 },
    { name: "Bengaluru South", lat: 12.9716, lng: 77.5946 },
    { name: "Kolkata East", lat: 22.5726, lng: 88.3639 }
  ];

  const loadTrialsSilent = () => {
    api.get("/trials")
      .then(res => {
        if (Array.isArray(res)) setTrials(res);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    let socket;
    let pollInterval;

    if (typeof window !== "undefined") {
      try {
        socket = ioClient(getSocketUrl(), {
          transports: ["websocket", "polling"],
          reconnection: true
        });

        socket.on("notification:new", () => {
          if (activeTab === "trials") loadTrialsSilent();
        });
      } catch (e) {
        console.warn(e);
      }

      pollInterval = setInterval(() => {
        if (activeTab === "trials") loadTrialsSilent();
      }, 4000);
    }

    if (activeTab === "trials") {
      loadTrials();
    } else {
      loadNearbyTournaments();
    }

    return () => {
      if (socket) socket.disconnect();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeTab, gpsSim]);

  const loadTrials = () => {
    setLoading(true);
    api.get("/trials")
      .then(res => {
        setTrials(res || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const loadNearbyTournaments = () => {
    setLoading(true);
    api.get(`/tournaments/nearby?lat=${gpsSim.lat}&lng=${gpsSim.lng}`)
      .then(res => {
        setTournaments(res || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleApplyTrial = async (trialId) => {
    setApplyingId(trialId);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.post(`/trials/${trialId}/apply`);
      setSuccessMsg("Successfully registered for trial! Moved to My Upcoming Trials.");
      loadTrials();
    } catch (err) {
      setErrorMsg(err.message || "Failed to register for trial.");
    } finally {
      setApplyingId(null);
    }
  };

  const handleDeclineTrial = async (trialId) => {
    setApplyingId(trialId);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.post(`/trials/${trialId}/decline`);
      setSuccessMsg("Trial invitation declined.");
      loadTrials();
    } catch (err) {
      setErrorMsg(err.message || "Failed to decline trial.");
    } finally {
      setApplyingId(null);
    }
  };

  const handleRegisterTournament = async (tId) => {
    setApplyingId(tId);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.post(`/tournaments/${tId}/join`);
      setSuccessMsg("Registration application submitted successfully!");
      loadNearbyTournaments();
    } catch (err) {
      setErrorMsg(err.message || "Failed to register for tournament.");
    } finally {
      setApplyingId(null);
    }
  };

  const availableTrials = trials.filter(t => !t.isRegistered && t.myStatus !== 'rejected');
  const myRegisteredTrials = trials.filter(t => t.isRegistered && t.myStatus !== 'rejected');

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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-850 pb-6">
          <div>
            <h2 className="text-3xl font-black uppercase text-white tracking-wider">Events & Scouting Board</h2>
            <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold">
              Register for public scouting trials, private invitations & regional leagues
            </p>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 shrink-0">
            <button
              onClick={() => setActiveTab("trials")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "trials"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" /> Scouting Trials
            </button>

            <button
              onClick={() => setActiveTab("tournaments")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "tournaments"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4" /> Regional Leagues
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-green-950/40 border border-green-500/50 flex items-center gap-3 text-green-200 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: SCOUTING TRIALS */}
        {activeTab === "trials" && (
          <div className="space-y-12">
            {/* SECTION 1: OPEN / AVAILABLE TRIALS */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                <h3 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-400" /> Available Trials & Open Invitations
                </h3>
                <span className="text-xs text-zinc-500 font-bold uppercase">{availableTrials.length} Available</span>
              </div>

              {loading ? (
                <div className="h-40 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Loading scouting trials...</span>
                </div>
              ) : availableTrials.length === 0 ? (
                <div className="p-8 bg-zinc-900/30 border border-zinc-800/80 rounded-3xl text-center text-zinc-500 text-xs">
                  No new unapplied open trials available right now. Check back soon!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableTrials.map(t => (
                    <div key={t._id} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                            t.privacy === "public"
                              ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}>
                            {t.privacy === "public" ? <Users className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {t.privacy === "public" ? "PUBLIC TRIAL" : "PRIVATE INVITATION"}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white uppercase truncate">{t.title}</h3>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                          Organized by: <span className="text-zinc-300 font-black">{getScoutDisplayName(t)}</span> {t.scoutOrganization ? `(${t.scoutOrganization})` : ""}
                        </span>

                        {t.description && (
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{t.description}</p>
                        )}

                        {/* TARGET TAGS */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {(t.ageCategory || []).map(g => (
                            <span key={g} className="text-[9px] font-bold bg-zinc-950 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800">
                              {g}
                            </span>
                          ))}
                          {(t.positionsTarget || []).map(p => (
                            <span key={p} className="text-[9px] font-bold bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-400/20">
                              {p}
                            </span>
                          ))}
                        </div>

                        <div className="space-y-2 border-t border-zinc-850 pt-4 text-xs text-zinc-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span>Date: {new Date(t.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span>Time: {t.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span className="truncate">Venue: {t.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center gap-3">
                        <button
                          onClick={() => handleApplyTrial(t._id)}
                          disabled={applyingId === t._id}
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider py-3.5 rounded-xl text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          {applyingId === t._id ? "Processing..." : (t.privacy === "private" ? "Accept Invitation" : "Register / Apply Now")}
                        </button>

                        <button
                          onClick={() => handleDeclineTrial(t._id)}
                          disabled={applyingId === t._id}
                          className="px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all shrink-0"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: MY REGISTERED & UPCOMING TRIALS */}
            <div className="space-y-4 pt-6 border-t border-zinc-850">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                <h3 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" /> My Registered & Upcoming Trials
                </h3>
                <span className="text-xs text-green-400 font-bold uppercase">{myRegisteredTrials.length} Registered</span>
              </div>

              {myRegisteredTrials.length === 0 ? (
                <div className="p-8 bg-zinc-900/30 border border-zinc-800/80 rounded-3xl text-center text-zinc-500 text-xs">
                  You haven't registered for any trials yet. Apply to available trials above!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myRegisteredTrials.map(t => (
                    <div key={t._id} className="bg-gradient-to-b from-zinc-900/60 to-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                            t.myStatus === "accepted"
                              ? "bg-green-500/20 text-green-400 border-green-500/40"
                              : "bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
                          }`}>
                            {t.myStatus === "accepted" ? "ACCEPTED ✓" : "PENDING SCOUT REVIEW"}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white uppercase truncate">{t.title}</h3>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                          Organized by: <span className="text-zinc-300 font-black">{getScoutDisplayName(t)}</span> {t.scoutOrganization ? `(${t.scoutOrganization})` : ""}
                        </span>

                        {t.description && (
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{t.description}</p>
                        )}

                        <div className="space-y-2 border-t border-zinc-850 pt-4 text-xs text-zinc-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span>Date: {new Date(t.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span>Time: {t.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span className="truncate">Venue: {t.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-zinc-500">Registration Status:</span>
                        <span className={t.myStatus === "accepted" ? "text-green-400 font-black" : "text-yellow-400 font-black"}>
                          {t.myStatus === "accepted" ? "CONFIRMED PARTICIPANT" : "REGISTRATION SUBMITTED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REGIONAL TOURNAMENTS */}
        {activeTab === "tournaments" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-800 rounded-xl p-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase pl-2">Simulated Region:</span>
                <select
                  value={gpsSim.name}
                  onChange={(e) => {
                    const targetLoc = locations.find(l => l.name === e.target.value);
                    if (targetLoc) setGpsSim(targetLoc);
                  }}
                  className="bg-zinc-950 border-none text-xs text-yellow-400 font-bold focus:outline-none rounded p-1 cursor-pointer"
                >
                  {locations.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="h-60 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Calculating distances...</span>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="p-12 bg-zinc-900/35 border border-zinc-800 rounded-3xl text-center text-zinc-500 text-xs">
                No upcoming tournaments found near this region. Try changing the simulated location!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((t) => (
                  <div key={t._id} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <span className="bg-yellow-400/10 text-yellow-400 text-[9px] font-black uppercase px-2.5 py-0.5 rounded border border-yellow-400/20">
                          Championship
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                          <Map className="w-3.5 h-3.5 text-yellow-400" /> {t.distanceKm} km away
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white uppercase truncate">{t.name}</h3>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed h-12 overflow-hidden line-clamp-3">
                        {t.description}
                      </p>

                      <div className="mt-6 space-y-2 border-t border-zinc-850 pt-4 text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span>Starts: {new Date(t.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="truncate">{t.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span>Organizer: {t.organizer}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-850">
                      <button
                        onClick={() => handleRegisterTournament(t._id)}
                        disabled={applyingId === t._id}
                        className="w-full bg-zinc-950 hover:bg-zinc-900 text-yellow-400 font-black uppercase tracking-wider py-3 rounded-xl border border-zinc-800 text-xs transition-all flex items-center justify-center gap-2"
                      >
                        {applyingId === t._id ? "Registering..." : "Apply to Register"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
