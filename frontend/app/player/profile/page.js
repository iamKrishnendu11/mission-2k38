"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Shield, Sparkles, TrendingUp, Calendar, MapPin, Award, Trophy, Video, ShieldAlert } from "lucide-react";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

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
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
          <h3 className="text-red-500 font-bold mb-2">Error Loading Profile</h3>
          <p className="text-zinc-400">{error}</p>
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
          {/* INTERACTIVE GOLD FUT CARD */}
          <div className="w-full md:w-80 flex-shrink-0 flex items-center justify-center">
            <div className="w-72 h-[420px] rounded-[30px] bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 p-[3px] shadow-[0_0_50px_rgba(250,204,21,0.2)] relative group hover:scale-[1.03] transition-all duration-300">
              <div className="w-full h-full bg-black rounded-[27px] overflow-hidden relative p-6 flex flex-col justify-between">
                {/* Decorative gold badge background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_65%)] pointer-events-none" />
                
                {/* FUT Card Header */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-yellow-400 leading-none">{displayOverall}</span>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">{profile.preferredPosition || "ST"}</span>
                  </div>
                  <Shield className="w-8 h-8 text-yellow-400 fill-yellow-400/25" />
                </div>

                {/* FUT Card Avatar Image */}
                <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-yellow-400/40 mx-auto relative z-10 bg-zinc-900 flex items-center justify-center">
                  {profile.profilePhoto ? (
                    <img 
                      src={profile.profilePhoto} 
                      alt="Player Card" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-black uppercase text-yellow-400">
                      {(profile.name || "Player").charAt(0)}
                    </span>
                  )}
                </div>

                {/* FUT Card User Title */}
                <div className="text-center z-10">
                  <h2 className="text-xl font-black uppercase tracking-wider text-white truncate px-2">
                    {profile.name}
                  </h2>
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block mt-0.5">
                    {profile.currentClub || "Unattached"} {profile.verifiedBadge && "✓"}
                  </span>
                </div>

                {/* FUT Card Rating Matrix */}
                <div className="grid grid-cols-3 gap-y-2 border-t border-zinc-800/80 pt-4 z-10">
                  {[
                    { label: "SPD", value: displaySpeed },
                    { label: "PAS", value: displayPassing },
                    { label: "DRI", value: displayDribbling },
                    { label: "SHO", value: displayShooting },
                    { label: "DEF", value: displayDefending },
                    { label: "PHY", value: displayPhysical },
                  ].map((attr) => (
                    <div key={attr.label} className="text-center">
                      <span className="block text-[8px] font-bold text-zinc-500 tracking-wider uppercase">{attr.label}</span>
                      <span className="text-sm font-black text-white">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TRANSFERMARKT PROFILE FIELDS */}
          <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="text-yellow-400 w-5 h-5" /> Player Dossier
                  </h3>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Transfermarkt Football Profile Details</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                  <div key={item.label} className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
                    <span className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{item.label}</span>
                    <span className="text-sm font-bold text-white uppercase">{item.value}</span>
                  </div>
                ))}
              </div>

              {profile.bio && (
                <div className="mt-6 bg-zinc-950/30 p-5 rounded-2xl border border-zinc-900">
                  <span className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Personal Biography</span>
                  <p className="text-zinc-300 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-zinc-800 pt-6 flex justify-between items-center text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {profile.city || profile.district || 'City'}, {profile.state || 'State'}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-yellow-400" /> Potential Rating: {isRated ? (skills.potential || 0) : 0}
              </div>
            </div>
          </div>
        </div>

        {/* CAREER STATS & MEDIA ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* STATS CARD */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 md:p-8">
            <h3 className="text-md font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
              <Trophy className="text-yellow-400 w-5 h-5" /> Season Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-center">
                <span className="block text-2xl font-black text-white">{profile.matchesPlayed ?? 0}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Matches Played</span>
              </div>
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-center">
                <span className="block text-2xl font-black text-yellow-400">{profile.goals ?? 0}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Goals Scored</span>
              </div>
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-center">
                <span className="block text-2xl font-black text-amber-400">{profile.assists ?? 0}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Assists</span>
              </div>
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-center">
                <span className="block text-2xl font-black text-emerald-400">{profile.cleanSheets ?? 0}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Clean Sheets</span>
              </div>
            </div>
          </div>

          {/* MEDIA & SOCIALS CARD */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-md font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
                <Video className="text-yellow-400 w-5 h-5" /> Highlights & Social Links
              </h3>

              {profile.highlightVideo ? (
                <div className="mb-6">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Featured Highlight reel</span>
                  <a href={profile.highlightVideo} target="_blank" rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-yellow-400/20 transition-all">
                    <Video className="w-4 h-4" /> Watch Highlight Video
                  </a>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 mb-6">No highlight video link added yet.</p>
              )}

              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Social Profiles</span>
                <div className="flex flex-wrap gap-3">
                  {socials.instagram && (
                    <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:text-white">
                      <FaInstagram className="w-4 h-4 text-pink-500" /> Instagram
                    </a>
                  )}
                  {socials.facebook && (
                    <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:text-white">
                      <FaFacebook className="w-4 h-4 text-blue-500" /> Facebook
                    </a>
                  )}
                  {socials.youtube && (
                    <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:text-white">
                      <FaYoutube className="w-4 h-4 text-red-500" /> YouTube Channel
                    </a>
                  )}
                  {!socials.instagram && !socials.facebook && !socials.youtube && (
                    <span className="text-xs text-zinc-600">No social channels connected.</span>
                  )}
                </div>
              </div>
            </div>

            {emergencyContact && emergencyContact.name && (
              <div className="mt-6 border-t border-zinc-800 pt-4 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-zinc-500">
                  <ShieldAlert className="w-4 h-4 text-yellow-400" /> Emergency Contact:
                </span>
                <span>{emergencyContact.name} ({emergencyContact.relation}) - {emergencyContact.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* CAREER TIMELINE */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 md:p-8">
          <h3 className="text-md font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
            <Award className="text-yellow-400 w-5 h-5" /> Football Career Timeline
          </h3>

          {careerTimeline && careerTimeline.length > 0 ? (
            <div className="relative border-l border-zinc-800 ml-4 space-y-6">
              {careerTimeline.map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
                    <span className="text-xs font-black text-yellow-400">{item.year}</span>
                    <h4 className="text-white font-bold text-sm mt-1">{item.club}</h4>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-4">
              <Calendar className="w-10 h-10 text-zinc-700 mx-auto" />
              <div>
                <h4 className="text-white text-sm font-bold">No Milestones Added</h4>
                <p className="text-zinc-500 text-xs mt-1">Timeline milestones help scouts view your track records.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
