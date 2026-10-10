"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Shield, Sparkles, TrendingUp, Calendar, MapPin, Award, Trophy, Video, ShieldAlert, User, FileText, Activity, Flag } from "lucide-react";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";
import { SlidingButton } from "@/app/login/components/SlidingButton";

export default function PlayerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/dashboard/profile")
      .then(res => {
        setProfile(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load player profile.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm tracking-widest font-bold uppercase">Generating Player Card...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-[#121214] border border-white/[0.04] rounded-2xl text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <h3 className="text-red-500 font-bold mb-2">Error Loading Profile</h3>
          <p className="text-white/50">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { skills = {}, careerTimeline = [], socials = {}, emergencyContact = {} } = profile;
  const isRated = (skills.scoutRatingsCount || 0) > 0;
  const displayOverall = isRated ? (skills.aiScore || skills.scoutScore || 0) : 0;
  const displaySpeed = isRated ? (skills.speed || 0) : 0;
  const displayPassing = isRated ? (skills.passing || 0) : 0;
  const displayDribbling = isRated ? (skills.dribbling || 0) : 0;
  const displayShooting = isRated ? (skills.finishing || skills.shooting || 0) : 0;
  const displayDefending = isRated ? (skills.defending || 0) : 0;
  const displayPhysical = isRated ? (skills.physical || 0) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 pb-12">
        <div className="flex flex-col md:flex-row gap-10 items-stretch">
          {/* INTERACTIVE PLAYER CARD */}
          <div className="w-full md:w-80 flex-shrink-0 flex items-center justify-center">
            <div className="w-72 h-[420px] rounded-[32px] bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative group hover:scale-[1.02] transition-all duration-300">
              <div className="w-full h-full rounded-[30px] overflow-hidden relative p-6 flex flex-col justify-between">
                {/* Decorative subtle background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.05),transparent_65%)] pointer-events-none" />
                
                {/* Card Header */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-white leading-none">{displayOverall}</span>
                    <span className="text-sm font-bold text-white/50 tracking-tight mt-1">{profile.preferredPosition || "ST"}</span>
                  </div>
                  <Shield className="w-8 h-8 text-white/10" />
                </div>

                {/* Avatar Image */}
                <div className="w-36 h-36 rounded-full overflow-hidden border border-white/[0.04] mx-auto relative z-10 bg-[#0a0a0c] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  {profile.profilePhoto ? (
                    <img 
                      src={profile.profilePhoto} 
                      alt="Player Card" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-black text-white/20">
                      {(profile.name || "Player").charAt(0)}
                    </span>
                  )}
                </div>

                {/* User Title */}
                <div className="text-center z-10">
                  <h2 className="text-xl font-bold tracking-tight text-white truncate px-2">
                    {profile.name}
                  </h2>
                  <span className="text-sm font-medium text-yellow-400 block mt-0.5">
                    {profile.currentClub || "Unattached"} {profile.verifiedBadge && "✓"}
                  </span>
                </div>

                {/* Rating Matrix */}
                <div className="grid grid-cols-3 gap-y-2 border-t border-white/[0.04] pt-4 z-10">
                  {[
                    { label: "SPD", value: displaySpeed },
                    { label: "PAS", value: displayPassing },
                    { label: "DRI", value: displayDribbling },
                    { label: "SHO", value: displayShooting },
                    { label: "DEF", value: displayDefending },
                    { label: "PHY", value: displayPhysical },
                  ].map((attr) => (
                    <div key={attr.label} className="text-center">
                      <span className="block text-[10px] font-bold text-white/40 tracking-tight">{attr.label}</span>
                      <span className="text-sm font-bold text-white">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TRANSFERMARKT PROFILE FIELDS */}
          <div className="flex-1 bg-[#121214] border border-white/[0.04] rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_40%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8 border-b border-white/[0.04] pb-6 pt-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                    <FileText className="w-6 h-6 text-yellow-400 drop-shadow-md" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Player Dossier</h3>
                    <span className="text-sm font-medium text-white/50 block mt-0.5">Transfermarkt Profile Details</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Age / Category", value: profile.age ? `${profile.age} Yrs (${profile.ageCategory || "Senior"})` : (profile.ageCategory || "Senior") },
                  { label: "Dominant Foot", value: profile.dominantFoot || "Right" },
                  { label: "Height", value: profile.height ? `${profile.height} cm` : "N/A" },
                  { label: "Weight", value: profile.weight ? `${profile.weight} kg` : "N/A" },
                  { label: "Preferred Position", value: profile.preferredPosition || "ST" },
                  { label: "Current Club", value: profile.currentClub || "Unattached" },
                  { label: "Previous Club", value: profile.previousClub || "N/A" },
                  { label: "Preferred League", value: profile.preferredLeague || "N/A" },
                  { label: "State Association", value: profile.state || "N/A" },
                  { label: "District / City", value: profile.district || profile.city || "N/A" },
                  { label: "Phone Contact", value: profile.phone || "Hidden" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#0a0a0c] p-4 rounded-[20px] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                    <span className="block text-xs tracking-tight text-white/40 font-medium mb-1">{item.label}</span>
                    <span className="text-base font-bold text-white tracking-tight">{item.value}</span>
                  </div>
                ))}
              </div>

              {profile.bio && (
                <div className="mt-6 bg-[#0a0a0c] p-6 rounded-[20px] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                  <span className="block text-xs tracking-tight text-white/40 font-medium mb-2">Personal Biography</span>
                  <p className="text-white/70 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-white/[0.04] pt-6 flex justify-between items-center text-xs text-white/40">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {profile.city || profile.district || 'City'}, {profile.state || 'State'}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-yellow-400 opacity-80" /> Potential Rating: {isRated ? (skills.potential || 0) : 0}
              </div>
            </div>
          </div>
        </div>

        {/* CAREER STATS & MEDIA ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* STATS CARD */}
          <div className="bg-[#121214] border border-white/[0.04] rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6 border-b border-white/[0.04] pb-6">
              <div className="w-12 h-12 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                <TrendingUp className="w-6 h-6 text-yellow-400 drop-shadow-md" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Season Statistics</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0a0c] p-5 rounded-[20px] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                <span className="block text-[11px] font-medium text-white/40 tracking-tight mb-2">Matches Played</span>
                <span className="block text-3xl font-black text-white">{profile.matchesPlayed ?? 0}</span>
              </div>
              <div className="bg-[#0a0a0c] p-5 rounded-[20px] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                <span className="block text-[11px] font-medium text-white/40 tracking-tight mb-2">Goals Scored</span>
                <span className="block text-3xl font-black text-yellow-400">{profile.goals ?? 0}</span>
              </div>
              <div className="bg-[#0a0a0c] p-5 rounded-[20px] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                <span className="block text-[11px] font-medium text-white/40 tracking-tight mb-2">Assists</span>
                <span className="block text-3xl font-black text-amber-400">{profile.assists ?? 0}</span>
              </div>
              <div className="bg-[#0a0a0c] p-5 rounded-[20px] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                <span className="block text-[11px] font-medium text-white/40 tracking-tight mb-2">Clean Sheets</span>
                <span className="block text-3xl font-black text-emerald-400">{profile.cleanSheets ?? 0}</span>
              </div>
            </div>
          </div>

          {/* MEDIA & SOCIALS CARD */}
          <div className="bg-[#121214] border border-white/[0.04] rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6 border-b border-white/[0.04] pb-6">
                <div className="w-12 h-12 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                  <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-md" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Highlights & Social Links</h3>
              </div>

              {profile.highlightVideo ? (
                <div className="mb-6">
                  <span className="block text-[11px] font-medium text-white/40 tracking-tight mb-2">Featured Highlight reel</span>
                  <a href={profile.highlightVideo} target="_blank" rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 shadow-[inset_0_1px_1px_rgba(250,204,21,0.1)] px-4 py-2 rounded-xl text-xs font-bold hover:bg-yellow-400/20 transition-all">
                    <Video className="w-4 h-4" /> Watch Highlight Video
                  </a>
                </div>
              ) : (
                <p className="text-xs text-white/40 mb-6">No highlight video link added yet.</p>
              )}

              <div className="space-y-3">
                <span className="block text-[11px] font-medium text-white/40 tracking-tight mb-1">Social Profiles</span>
                <div className="flex flex-wrap gap-3">
                  {socials.instagram && (
                    <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0a0a0c] p-3 rounded-xl border border-white/[0.02] text-xs text-white/70 hover:text-white transition-colors">
                      <FaInstagram className="w-4 h-4 text-pink-500" /> Instagram
                    </a>
                  )}
                  {socials.facebook && (
                    <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0a0a0c] p-3 rounded-xl border border-white/[0.02] text-xs text-white/70 hover:text-white transition-colors">
                      <FaFacebook className="w-4 h-4 text-blue-500" /> Facebook
                    </a>
                  )}
                  {socials.youtube && (
                    <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0a0a0c] p-3 rounded-xl border border-white/[0.02] text-xs text-white/70 hover:text-white transition-colors">
                      <FaYoutube className="w-4 h-4 text-red-500" /> YouTube Channel
                    </a>
                  )}
                  {!socials.instagram && !socials.facebook && !socials.youtube && (
                    <span className="text-xs text-white/40">No social channels connected.</span>
                  )}
                </div>
              </div>
            </div>

            {emergencyContact && emergencyContact.name && (
              <div className="mt-6 border-t border-white/[0.04] pt-4 flex items-center justify-between text-xs text-white/50">
                <span className="flex items-center gap-1.5 font-bold tracking-tight text-[11px] text-white/40">
                  <ShieldAlert className="w-4 h-4 text-yellow-400 opacity-80" /> Emergency Contact:
                </span>
                <span>{emergencyContact.name} ({emergencyContact.relation}) - {emergencyContact.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* CAREER TIMELINE */}
        <div className="bg-[#121214] border border-white/[0.04] rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6 border-b border-white/[0.04] pb-6">
            <div className="w-12 h-12 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
              <Activity className="w-6 h-6 text-yellow-400 drop-shadow-md" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Football Career Timeline</h3>
          </div>

          {careerTimeline && careerTimeline.length > 0 ? (
            <div className="relative border-l border-white/[0.04] ml-4 space-y-6">
              {careerTimeline.map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                  <div className="bg-[#0a0a0c] p-4 rounded-xl border border-white/[0.02]">
                    <span className="text-xs font-black text-yellow-400">{item.year}</span>
                    <h4 className="text-white font-bold text-sm mt-1">{item.club}</h4>
                    <p className="text-white/50 text-xs mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-4">
              <Calendar className="w-10 h-10 text-white/20 mx-auto" />
              <div>
                <h4 className="text-white text-sm font-bold">No Milestones Added</h4>
                <p className="text-white/40 text-xs mt-1">Timeline milestones help scouts view your track records.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
