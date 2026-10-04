"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  X, Star, MessageSquare, Calendar, ShieldCheck, MapPin, 
  Sparkles, Trophy, Video, Shield, Award, 
  ShieldAlert, CheckCircle2, Sliders, Check
} from "lucide-react";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

const POSITION_WEIGHTS = {
  'ST':  { passing: 0.15, shooting: 0.35, dribbling: 0.20, speed: 0.20, defending: 0.00, physical: 0.10 },
  'LW':  { passing: 0.20, shooting: 0.20, dribbling: 0.30, speed: 0.25, defending: 0.00, physical: 0.05 },
  'RW':  { passing: 0.20, shooting: 0.20, dribbling: 0.30, speed: 0.25, defending: 0.00, physical: 0.05 },
  'CAM': { passing: 0.30, shooting: 0.20, dribbling: 0.25, speed: 0.10, defending: 0.05, physical: 0.10 },
  'CM':  { passing: 0.30, shooting: 0.10, dribbling: 0.20, speed: 0.10, defending: 0.15, physical: 0.15 },
  'CDM': { passing: 0.20, shooting: 0.05, dribbling: 0.10, speed: 0.10, defending: 0.35, physical: 0.20 },
  'LB':  { passing: 0.20, shooting: 0.00, dribbling: 0.10, speed: 0.20, defending: 0.35, physical: 0.15 },
  'RB':  { passing: 0.20, shooting: 0.00, dribbling: 0.10, speed: 0.20, defending: 0.35, physical: 0.15 },
  'WB':  { passing: 0.25, shooting: 0.05, dribbling: 0.20, speed: 0.25, defending: 0.15, physical: 0.10 },
  'CB':  { passing: 0.10, shooting: 0.00, dribbling: 0.05, speed: 0.10, defending: 0.45, physical: 0.30 },
  'GK':  { passing: 0.00, shooting: 0.00, dribbling: 0.00, speed: 0.00, defending: 0.60, physical: 0.40 }
};

function getWeightsForPos(pos = 'ST') {
  const p = (pos || 'ST').toUpperCase();
  return POSITION_WEIGHTS[p] || POSITION_WEIGHTS['ST'];
}

function calcLiveScoutScore(attrs, pos = 'ST') {
  const w = getWeightsForPos(pos);
  const score = (
    (Number(attrs.passing) || 0) * w.passing +
    (Number(attrs.shooting) || 0) * w.shooting +
    (Number(attrs.dribbling) || 0) * w.dribbling +
    (Number(attrs.speed) || 0) * w.speed +
    (Number(attrs.defending) || 0) * w.defending +
    (Number(attrs.physical) || 0) * w.physical
  );
  return Math.round(score);
}

export default function PlayerInspectModal({ 
  player, 
  onClose, 
  onSaveToggle, 
  isSaved = false, 
  onStartChat,
  onScheduleTrial
}) {
  const [showTrialForm, setShowTrialForm] = useState(false);
  const [trialDetails, setTrialDetails] = useState({ date: "", time: "", location: "", notes: "" });
  const [submittingTrial, setSubmittingTrial] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState(false);

  // Scout Rating State
  const [ratingInputs, setRatingInputs] = useState({
    speed: 50,
    passing: 50,
    dribbling: 50,
    shooting: 50,
    defending: 50,
    physical: 50
  });
  const [currentSkills, setCurrentSkills] = useState(player?.skills || {});
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState(null);
  const [showRateForm, setShowRateForm] = useState(false);

  useEffect(() => {
    if (player) {
      setCurrentSkills(player.skills || {});
      const pId = player.user?._id || player.user || player._id;
      if (pId) {
        api.get(`/dashboard/scout/rate/${pId}`)
          .then(res => {
            if (res.myRating) {
              setRatingInputs({
                speed: res.myRating.speed || 50,
                passing: res.myRating.passing || 50,
                dribbling: res.myRating.dribbling || 50,
                shooting: res.myRating.shooting || 50,
                defending: res.myRating.defending || 50,
                physical: res.myRating.physical || 50
              });
            }
            if (res.skills) {
              setCurrentSkills(res.skills);
            }
          })
          .catch(err => console.error(err));
      }
    }
  }, [player]);

  if (!player) return null;

  const position = player.preferredPosition || 'ST';
  const posWeights = getWeightsForPos(position);
  const liveScore = calcLiveScoutScore(ratingInputs, position);

  const isRated = (currentSkills.scoutRatingsCount || 0) > 0;
  const displayOverall = isRated ? (currentSkills.aiScore || currentSkills.scoutScore || 0) : 0;
  const displaySpeed = isRated ? (currentSkills.speed || 0) : 0;
  const displayPassing = isRated ? (currentSkills.passing || 0) : 0;
  const displayDribbling = isRated ? (currentSkills.dribbling || 0) : 0;
  const displayShooting = isRated ? (currentSkills.finishing || currentSkills.shooting || 0) : 0;
  const displayDefending = isRated ? (currentSkills.defending || 0) : 0;
  const displayPhysical = isRated ? (currentSkills.physical || 0) : 0;

  const careerTimeline = player.careerTimeline || [];
  const socials = player.socials || {};
  const emergencyContact = player.emergencyContact || {};

  const handleTrialSubmit = async (e) => {
    e.preventDefault();
    if (!onScheduleTrial) return;
    setSubmittingTrial(true);
    try {
      await onScheduleTrial(trialDetails);
      setTrialSuccess(true);
      setTimeout(() => {
        setShowTrialForm(false);
        setTrialSuccess(false);
        setTrialDetails({ date: "", time: "", location: "", notes: "" });
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTrial(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    setRatingSuccessMsg(null);
    try {
      const pId = player.user?._id || player.user || player._id;
      const res = await api.post("/dashboard/scout/rate", {
        playerId: pId,
        ...ratingInputs
      });
      setRatingSuccessMsg(`Rating saved! Calculated Scout Score: ${res.scoutScore}/99 (Position: ${position})`);
      if (res.skills) {
        setCurrentSkills(res.skills);
      }
    } catch (err) {
      console.error("Scout rating error:", err);
      alert("Failed to submit rating: " + err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div 
        data-lenis-prevent 
        className="relative w-full max-w-3xl bg-zinc-950 border-l border-zinc-800 h-full p-6 md:p-8 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl space-y-8"
      >
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="bg-yellow-400/10 text-yellow-400 font-bold uppercase text-[10px] tracking-widest px-3 py-1 rounded-full border border-yellow-400/20">
              Full Player Card & Dossier
            </span>
            {isRated ? (
              <span className="bg-green-950 text-green-400 font-bold uppercase text-[9px] tracking-widest px-2.5 py-0.5 rounded-md border border-green-800">
                Rated by {currentSkills.scoutRatingsCount} Scout{currentSkills.scoutRatingsCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="bg-red-950 text-red-400 font-bold uppercase text-[9px] tracking-widest px-2.5 py-0.5 rounded-md border border-red-800">
                Unrated (0 Ratings)
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: FUT CARD & OVERVIEW */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* GOLD FUT CARD */}
          <div className="w-64 h-[380px] rounded-[28px] bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 p-[3px] shadow-[0_0_35px_rgba(250,204,21,0.2)] shrink-0 relative group">
            <div className="w-full h-full bg-black rounded-[25px] overflow-hidden relative p-5 flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_65%)] pointer-events-none" />

              {/* FUT Header */}
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-yellow-400 leading-none">{displayOverall}</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{position}</span>
                </div>
                <Shield className="w-7 h-7 text-yellow-400 fill-yellow-400/25" />
              </div>

              {/* Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-yellow-400/40 mx-auto relative z-10 bg-zinc-900">
                <img 
                  src={player.profilePhoto || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150"} 
                  alt={player.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Player Name */}
              <div className="text-center z-10">
                <h3 className="text-base font-black uppercase tracking-wider text-white truncate px-1 flex items-center justify-center gap-1">
                  {player.name}
                  {player.verifiedBadge && <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                </h3>
                <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest block mt-0.5">
                  {player.currentClub || "Unattached"}
                </span>
              </div>

              {/* FUT Attributes */}
              <div className="grid grid-cols-3 gap-y-1.5 border-t border-zinc-800/80 pt-3 z-10">
                {[
                  { label: "PAC", value: displaySpeed },
                  { label: "PAS", value: displayPassing },
                  { label: "DRI", value: displayDribbling },
                  { label: "SHO", value: displayShooting },
                  { label: "DEF", value: displayDefending },
                  { label: "PHY", value: displayPhysical },
                ].map((attr) => (
                  <div key={attr.label} className="text-center">
                    <span className="block text-[7px] font-bold text-zinc-500 tracking-wider uppercase">{attr.label}</span>
                    <span className="text-xs font-black text-white">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ATHLETIC DOSSIER */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h4 className="text-xs font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Transfermarkt Athletic Dossier
              </h4>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                Potential: {isRated ? (currentSkills.potential || 0) : 0}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Age / Category", value: player.age ? `${player.age} Yrs (${player.ageCategory || "Senior"})` : (player.ageCategory || "Senior") },
                { label: "Dominant Foot", value: player.dominantFoot || "Right" },
                { label: "Height", value: player.height ? `${player.height} cm` : "N/A" },
                { label: "Weight", value: player.weight ? `${player.weight} kg` : "N/A" },
                { label: "Preferred Position", value: position },
                { label: "Current Club", value: player.currentClub || "Unattached" },
                { label: "Previous Club", value: player.previousClub || "N/A" },
                { label: "Preferred League", value: player.preferredLeague || "N/A" },
                { label: "State Association", value: player.state || "N/A" },
                { label: "District / City", value: player.district || player.city || "N/A" },
                { label: "Phone Contact", value: player.phone || "Hidden" },
              ].map((item) => (
                <div key={item.label} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850">
                  <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{item.label}</span>
                  <span className="text-xs font-bold text-white uppercase truncate block">{item.value}</span>
                </div>
              ))}
            </div>

            {(player.city || player.state) && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                <span>{[player.city, player.district, player.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: SCOUT RATING & EVALUATION PANEL (OUT OF 99) */}
        <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-yellow-400/30 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
            <div>
              <h4 className="text-sm font-black uppercase text-yellow-400 tracking-wider flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-yellow-400" /> Scout Player Evaluation & Rating
              </h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Rate player attributes out of 99. The Overall score is calculated using position weights for <strong className="text-yellow-400">{position}</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowRateForm(!showRateForm)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showRateForm ? "Hide Rating Form" : "Rate This Player"}</span>
            </button>
          </div>

          {/* Position Weighting Breakdown Pill */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
            <span className="block text-[9px] uppercase tracking-widest font-black text-zinc-400 mb-2">
              Position Formula Weights [{position}]:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="block text-[8px] text-zinc-500 font-bold uppercase">Pace (Speed)</span>
                <span className="font-bold text-yellow-400">{Math.round(posWeights.speed * 100)}%</span>
              </div>
              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="block text-[8px] text-zinc-500 font-bold uppercase">Passing</span>
                <span className="font-bold text-yellow-400">{Math.round(posWeights.passing * 100)}%</span>
              </div>
              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="block text-[8px] text-zinc-500 font-bold uppercase">Dribbling</span>
                <span className="font-bold text-yellow-400">{Math.round(posWeights.dribbling * 100)}%</span>
              </div>
              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="block text-[8px] text-zinc-500 font-bold uppercase">Shooting</span>
                <span className="font-bold text-yellow-400">{Math.round(posWeights.shooting * 100)}%</span>
              </div>
              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="block text-[8px] text-zinc-500 font-bold uppercase">Defending</span>
                <span className="font-bold text-yellow-400">{Math.round(posWeights.defending * 100)}%</span>
              </div>
              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="block text-[8px] text-zinc-500 font-bold uppercase">Physical</span>
                <span className="font-bold text-yellow-400">{Math.round(posWeights.physical * 100)}%</span>
              </div>
            </div>
          </div>

          {showRateForm && (
            <form onSubmit={handleRatingSubmit} className="space-y-6 pt-2">
              {ratingSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-green-950/60 border border-green-500/50 text-green-200 text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span>{ratingSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { key: "speed", label: "Pace / Speed", weight: posWeights.speed },
                  { key: "passing", label: "Passing", weight: posWeights.passing },
                  { key: "dribbling", label: "Dribbling", weight: posWeights.dribbling },
                  { key: "shooting", label: "Shooting", weight: posWeights.shooting },
                  { key: "defending", label: "Defending", weight: posWeights.defending },
                  { key: "physical", label: "Physical", weight: posWeights.physical },
                ].map(({ key, label, weight }) => (
                  <div key={key} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>{label} ({Math.round(weight * 100)}% Weight)</span>
                      <span className="text-yellow-400 font-mono text-sm font-black">{ratingInputs[key]} / 99</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="99"
                      value={ratingInputs[key]}
                      onChange={(e) => setRatingInputs(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full accent-yellow-400 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 font-bold">
                      <span>0</span>
                      <span>50</span>
                      <span>99</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Real-time Calculated Score Preview */}
              <div className="bg-zinc-900 p-4 rounded-2xl border border-yellow-400/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Calculated Scout Score Preview</span>
                  <p className="text-xs text-zinc-500">Based on weighted formula for {position}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-3xl font-black text-yellow-400">{liveScore}</span>
                    <span className="text-xs text-zinc-400 font-bold"> / 99</span>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingRating}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black uppercase tracking-wider text-xs px-6 py-3 rounded-xl transition-all shadow-lg shrink-0 disabled:opacity-50"
                  >
                    {submittingRating ? "Saving..." : "Save Rating"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* SECTION 3: SEASON STATISTICS */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Trophy className="text-yellow-400 w-4 h-4" /> Season Statistics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 text-center">
              <span className="block text-xl font-black text-white">{player.matchesPlayed ?? 0}</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Matches Played</span>
            </div>
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 text-center">
              <span className="block text-xl font-black text-yellow-400">{player.goals ?? 0}</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Goals Scored</span>
            </div>
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 text-center">
              <span className="block text-xl font-black text-amber-400">{player.assists ?? 0}</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Assists</span>
            </div>
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 text-center">
              <span className="block text-xl font-black text-emerald-400">{player.cleanSheets ?? 0}</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Clean Sheets</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: BIOGRAPHY */}
        {player.bio && (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Biography</h4>
            <p className="text-zinc-300 text-xs leading-relaxed">{player.bio}</p>
          </div>
        )}

        {/* SECTION 5: HIGHLIGHTS & SOCIAL PROFILES */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Video className="text-yellow-400 w-4 h-4" /> Highlights & Media Links
          </h4>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {player.highlightVideo ? (
              <a 
                href={player.highlightVideo} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-yellow-400/20 transition-all"
              >
                <Video className="w-4 h-4" /> Watch Highlight Video
              </a>
            ) : (
              <span className="text-xs text-zinc-600">No highlight video provided.</span>
            )}

            <div className="flex flex-wrap gap-2">
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:text-white">
                  <FaInstagram className="w-3.5 h-3.5 text-pink-500" /> Instagram
                </a>
              )}
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:text-white">
                  <FaFacebook className="w-3.5 h-3.5 text-blue-500" /> Facebook
                </a>
              )}
              {socials.youtube && (
                <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:text-white">
                  <FaYoutube className="w-3.5 h-3.5 text-red-500" /> YouTube
                </a>
              )}
            </div>
          </div>

          {emergencyContact && emergencyContact.name && (
            <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1 font-bold uppercase text-[9px] text-zinc-500">
                <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" /> Emergency Contact:
              </span>
              <span className="text-xs font-bold text-zinc-300">{emergencyContact.name} ({emergencyContact.relation}) - {emergencyContact.phone}</span>
            </div>
          )}
        </div>

        {/* SECTION 6: CAREER TIMELINE */}
        {careerTimeline && careerTimeline.length > 0 && (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Award className="text-yellow-400 w-4 h-4" /> Career Milestones
            </h4>
            <div className="relative border-l border-zinc-800 ml-3 space-y-4">
              {careerTimeline.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[4px] top-1 w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                    <span className="text-[10px] font-black text-yellow-400">{item.year}</span>
                    <h5 className="text-white font-bold text-xs mt-0.5">{item.club}</h5>
                    {item.description && <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: ACTION BUTTONS & TRYOUT FORM */}
        <div className="border-t border-zinc-850 pt-6 space-y-4 shrink-0">
          <div className="flex gap-4">
            {onSaveToggle && (
              <button 
                onClick={onSaveToggle}
                className={`flex-1 font-bold text-xs uppercase py-3.5 rounded-xl transition-all border flex items-center justify-center gap-2 ${
                  isSaved
                    ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                }`}
              >
                <Star className={`w-4 h-4 ${isSaved ? "fill-black stroke-black" : ""}`} />
                {isSaved ? "SAVED PROSPECT ✓" : "SAVE PROSPECT"}
              </button>
            )}

            {onStartChat && (
              <button 
                onClick={onStartChat}
                className="flex-1 bg-zinc-900 border border-zinc-800 text-yellow-400 hover:text-white font-bold text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4.5 h-4.5" /> Start Chat
              </button>
            )}
          </div>

          {onScheduleTrial && (
            <div className="space-y-3">
              <button
                onClick={() => setShowTrialForm(!showTrialForm)}
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>Invite to Tryout</span>
              </button>

              {showTrialForm && (
                <form onSubmit={handleTrialSubmit} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-4">
                  {trialSuccess && (
                    <div className="p-3 rounded bg-green-950/40 border border-green-500/50 text-green-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Trial Invite Sent!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Date</label>
                      <input 
                        type="date" 
                        required 
                        value={trialDetails.date} 
                        onChange={e => setTrialDetails(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Time</label>
                      <input 
                        type="text" 
                        placeholder="10:00 AM" 
                        required 
                        value={trialDetails.time} 
                        onChange={e => setTrialDetails(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Location Venue</label>
                    <input 
                      type="text" 
                      placeholder="Football Ground Venue" 
                      required 
                      value={trialDetails.location} 
                      onChange={e => setTrialDetails(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" 
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Notes / Instructions</label>
                    <textarea 
                      rows="2" 
                      placeholder="Wear kit..." 
                      value={trialDetails.notes} 
                      onChange={e => setTrialDetails(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" 
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTrial || trialSuccess}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold uppercase tracking-wider text-xs py-2.5 rounded-xl transition-all"
                  >
                    {submittingTrial ? "Sending..." : "Submit Tryout Invitation"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
