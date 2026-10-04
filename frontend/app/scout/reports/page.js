"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  FileText, Plus, Search, ShieldCheck, MapPin, Calendar, 
  Award, Trash2, CheckCircle2, AlertCircle, X, Sparkles, User
} from "lucide-react";

export default function ScoutReportsPage() {
  const [reports, setReports] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    playerId: "",
    matchEvent: "Scouting Trial Match",
    location: "State Football Stadium",
    tacticalRole: "ST",
    recommendation: "SHORTLIST_FOR_TRIAL",
    strengths: "",
    weaknesses: "",
    verdict: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) setCurrentUser(JSON.parse(uStr));
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, scoutDashRes] = await Promise.all([
        api.get("/dashboard/scout/reports").catch(() => []),
        api.get("/dashboard/scout/dashboard").catch(() => ({}))
      ]);
      setReports(reportsRes || []);
      setPlayers(scoutDashRes?.savedPlayers || []);
    } catch (e) {
      console.error("Error loading scout reports:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!formData.playerId) {
      alert("Please select a player to evaluate.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/dashboard/scout/reports", formData);
      setShowCreateModal(false);
      setFormData({
        playerId: "",
        matchEvent: "Scouting Trial Match",
        location: "State Football Stadium",
        tacticalRole: "ST",
        recommendation: "SHORTLIST_FOR_TRIAL",
        strengths: "",
        weaknesses: "",
        verdict: ""
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to create report: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      await api.delete(`/dashboard/scout/reports/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case "SIGN_IMMEDIATELY":
        return <span className="bg-amber-400/20 text-yellow-400 border border-yellow-400/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">🌟 Sign Immediately</span>;
      case "SHORTLIST_FOR_TRIAL":
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">📋 Shortlist for Trial</span>;
      case "MONITOR_DEVELOPMENT":
        return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">👁️ Monitor Development</span>;
      case "PASS":
        return <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Pass</span>;
      default:
        return <span className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{rec}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-850 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-7 h-7 text-yellow-400" />
              <h2 className="text-3xl font-black uppercase text-white tracking-wider">Scout Reports</h2>
            </div>
            <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold">
              Official scouting evaluations, tactical dossiers, and talent observation notes
            </p>
          </div>

          {currentUser?.role === "scout" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase text-xs px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Create Scout Report</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Loading Scout Reports...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 bg-zinc-900/35 border border-zinc-800 rounded-3xl text-center space-y-4">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-white font-bold text-base uppercase">No Scout Reports Found</h3>
              <p className="text-zinc-500 text-xs max-w-md mx-auto">
                {currentUser?.role === "scout" 
                  ? "You haven't generated any official scouting reports yet. Click below to evaluate saved prospects!" 
                  : "No official scout reports have been filed for your profile yet."}
              </p>
            </div>
            {currentUser?.role === "scout" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-yellow-400 text-black font-black uppercase text-xs px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create First Report
              </button>
            )}
          </div>
        ) : (
          /* Reports Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((r) => (
              <div key={r._id} className="bg-zinc-950 border border-zinc-800 hover:border-yellow-400/50 rounded-3xl p-6 relative overflow-hidden transition-all shadow-xl space-y-5">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-zinc-850 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-black text-lg shadow">
                      {r.overallScore || 0}
                    </div>
                    <div>
                      <h3 className="text-white font-black text-lg uppercase tracking-wider">{r.playerName}</h3>
                      <p className="text-xs text-yellow-400/90 font-bold uppercase tracking-widest mt-0.5">
                        Role: {r.tacticalRole} • {r.matchEvent}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 mt-1">
                        <User className="w-3 h-3 text-yellow-400" /> Filed by <span className="text-white font-bold">{r.scoutName || 'Scout'}</span> ({r.scoutOrganization || 'Mission 2K38 Scout'})
                      </p>
                    </div>
                  </div>

                  {currentUser?.role === "scout" && (
                    <button
                      onClick={() => handleDeleteReport(r._id)}
                      className="p-2 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Recommendation Banner */}
                <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Scout Verdict:</span>
                  {getRecommendationBadge(r.recommendation)}
                </div>

                {/* Details Meta */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-850">
                    <Calendar className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span className="truncate">{new Date(r.date || r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-850">
                    <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span className="truncate">{r.location || "Ground Venue"}</span>
                  </div>
                </div>

                {/* Strengths & Attribute Scores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {r.strengths && (
                    <div className="bg-green-950/20 border border-green-500/30 p-3.5 rounded-2xl space-y-1">
                      <span className="text-[9px] font-black uppercase text-green-400 tracking-wider block">Skill Ratings & Breakdown</span>
                      <p className="text-zinc-300 text-xs leading-relaxed font-mono">{r.strengths}</p>
                    </div>
                  )}
                  {r.weaknesses && (
                    <div className="bg-red-950/20 border border-red-500/30 p-3.5 rounded-2xl space-y-1">
                      <span className="text-[9px] font-black uppercase text-red-400 tracking-wider block">Areas for Growth</span>
                      <p className="text-zinc-300 text-xs leading-relaxed">{r.weaknesses}</p>
                    </div>
                  )}
                </div>

                {/* Scouting Video Link */}
                {r.scoutingVideo && (
                  <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-850 flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Attached Scouting Video
                    </span>
                    <a
                      href={r.scoutingVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 font-bold hover:underline underline-offset-2 text-xs"
                    >
                      Watch Video ↗
                    </a>
                  </div>
                )}

                {/* Final Verdict */}
                {r.verdict && (
                  <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 space-y-1">
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Tactical Summary & Notes</span>
                    <p className="text-zinc-200 text-xs leading-relaxed italic">"{r.verdict}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CREATE SCOUT REPORT MODAL */}
        {showCreateModal && (
          <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div data-lenis-prevent className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-6 my-auto shadow-2xl relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 border-b border-zinc-850 pb-4">
                <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-400" /> Write Official Scout Report
                </h3>
                <p className="text-xs text-zinc-400">File a detailed scouting dossier and recommendation for a player.</p>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4">
                {/* Select Player */}
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Target Player</label>
                  {players.length > 0 ? (
                    <select
                      required
                      value={formData.playerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, playerId: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                    >
                      <option value="">Select a player from saved prospects...</option>
                      {players.map(p => (
                        <option key={p._id} value={p.user?._id || p.user || p._id}>
                          {p.name} ({p.preferredPosition} • Score: {p.skills?.aiScore || p.skills?.scoutScore || 0})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter Player User ID..."
                      required
                      value={formData.playerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, playerId: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Match / Scouting Context</label>
                    <input
                      type="text"
                      placeholder="e.g. State Championship Final"
                      required
                      value={formData.matchEvent}
                      onChange={(e) => setFormData(prev => ({ ...prev, matchEvent: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Tactical Role Played</label>
                    <select
                      value={formData.tacticalRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, tacticalRole: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                    >
                      {["ST", "LW", "RW", "CAM", "CM", "CDM", "LB", "RB", "WB", "CB", "GK"].map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Location Venue</label>
                    <input
                      type="text"
                      placeholder="Match Location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Official Scout Verdict</label>
                    <select
                      value={formData.recommendation}
                      onChange={(e) => setFormData(prev => ({ ...prev, recommendation: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white font-bold"
                    >
                      <option value="SIGN_IMMEDIATELY">🌟 Sign Immediately</option>
                      <option value="SHORTLIST_FOR_TRIAL">📋 Shortlist for Trial</option>
                      <option value="MONITOR_DEVELOPMENT">👁️ Monitor Development</option>
                      <option value="PASS">Pass</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Key Strengths</label>
                  <textarea
                    rows="2"
                    placeholder="Fast acceleration, sharp finishing..."
                    value={formData.strengths}
                    onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Areas for Growth</label>
                  <textarea
                    rows="2"
                    placeholder="Weaker foot passing..."
                    value={formData.weaknesses}
                    onChange={(e) => setFormData(prev => ({ ...prev, weaknesses: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Summary Verdict & Tactical Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Final scouting summary..."
                    value={formData.verdict}
                    onChange={(e) => setFormData(prev => ({ ...prev, verdict: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all shadow-lg"
                  >
                    {submitting ? "Submitting Report..." : "File Official Scout Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
