"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Save, AlertCircle, CheckCircle2, User, Activity, Trophy, ShieldAlert, Share2 } from "lucide-react";

export default function PlayerSettings() {
  const [formData, setFormData] = useState({
    // Core & Personal
    name: "",
    phone: "",
    dob: "",
    ageCategory: "Senior",
    gender: "male",
    bio: "",
    profilePhoto: "",
    state: "",
    district: "",
    city: "",
    pin: "",

    // Pitch Dossier & Physical
    height: "",
    weight: "",
    dominantFoot: "right",
    preferredPosition: "ST",
    fitnessLevel: "good",
    availability: "available",

    // Club & Career
    currentClub: "",
    previousClub: "",
    preferredLeague: "",
    highlightVideo: "",

    // Career Statistics
    matchesPlayed: "0",
    goals: "0",
    assists: "0",
    cleanSheets: "0",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Socials
    instagram: "",
    facebook: "",
    youtube: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Avatar image size must be less than 10MB.");
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);
      const res = await api.upload("/upload/image", uploadData);
      if (res && (res.secure_url || res.url)) {
        const cloudinaryUrl = res.secure_url || res.url;
        setFormData((prev) => ({ ...prev, profilePhoto: cloudinaryUrl }));
      } else {
        throw new Error("Failed to retrieve Cloudinary URL");
      }
    } catch (err) {
      console.error("Avatar Cloudinary upload error:", err);
      setError("Cloudinary Avatar Upload Failed: " + (err.message || "Ensure Cloudinary is configured in .env"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    api.get("/dashboard/profile")
      .then(res => {
        if (res) {
          let formattedDob = "";
          if (res.dob) {
            try {
              formattedDob = new Date(res.dob).toISOString().split("T")[0];
            } catch (e) {
              formattedDob = res.dob;
            }
          }

          setFormData({
            name: res.name || "",
            phone: res.phone || "",
            dob: formattedDob,
            ageCategory: res.ageCategory || "Senior",
            gender: res.gender || "male",
            bio: res.bio || "",
            profilePhoto: res.profilePhoto || "",
            state: res.state || "",
            district: res.district || "",
            city: res.city || "",
            pin: res.pin || "",

            height: res.height !== undefined && res.height !== null ? String(res.height) : "",
            weight: res.weight !== undefined && res.weight !== null ? String(res.weight) : "",
            dominantFoot: res.dominantFoot || "right",
            preferredPosition: res.preferredPosition || "ST",
            fitnessLevel: res.fitnessLevel || "good",
            availability: res.availability || "available",

            currentClub: res.currentClub || "",
            previousClub: res.previousClub || "",
            preferredLeague: res.preferredLeague || "",
            highlightVideo: res.highlightVideo || "",

            matchesPlayed: res.matchesPlayed !== undefined && res.matchesPlayed !== null ? String(res.matchesPlayed) : "0",
            goals: res.goals !== undefined && res.goals !== null ? String(res.goals) : "0",
            assists: res.assists !== undefined && res.assists !== null ? String(res.assists) : "0",
            cleanSheets: res.cleanSheets !== undefined && res.cleanSheets !== null ? String(res.cleanSheets) : "0",

            emergencyContactName: res.emergencyContact?.name || "",
            emergencyContactPhone: res.emergencyContact?.phone || "",
            emergencyContactRelation: res.emergencyContact?.relation || "",

            instagram: res.socials?.instagram || "",
            facebook: res.socials?.facebook || "",
            youtube: res.socials?.youtube || ""
          });
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load settings.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const payload = {
        ...formData,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        matchesPlayed: formData.matchesPlayed ? Number(formData.matchesPlayed) : 0,
        goals: formData.goals ? Number(formData.goals) : 0,
        assists: formData.assists ? Number(formData.assists) : 0,
        cleanSheets: formData.cleanSheets ? Number(formData.cleanSheets) : 0,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation
        },
        socials: {
          instagram: formData.instagram,
          facebook: formData.facebook,
          youtube: formData.youtube
        }
      };

      const res = await api.put("/dashboard/profile", payload);
      setSuccess(true);

      // Update local cache & notify layout
      if (res && (res.profile || res)) {
        const pObj = res.profile || res;
        localStorage.setItem("profile", JSON.stringify(pObj));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("profile-updated"));
        }
      }
    } catch (err) {
      setError(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm tracking-widest font-bold uppercase">Opening Settings Panel...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h2 className="text-3xl font-black uppercase text-white tracking-wider">Account & Player Settings</h2>
          <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold">
            Modify all pitch dossier metrics, personal info, stats, and emergency contacts
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-950/40 border border-green-500/50 flex items-center gap-3 text-green-200 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <span>Settings updated & saved to database successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. PERSONAL & LOCATION PROFILING */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Personal & Location Profiling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm text-zinc-300" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Age Category</label>
                  <select name="ageCategory" value={formData.ageCategory} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm">
                    <option value="U-13">U-13 (Under 13)</option>
                    <option value="U-15">U-15 (Under 15)</option>
                    <option value="U-17">U-17 (Under 17)</option>
                    <option value="U-19">U-19 (Under 19)</option>
                    <option value="U-21">U-21 (Under 21)</option>
                    <option value="U-23">U-23 (Under 23)</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Delhi"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="e.g. New Delhi"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. New Delhi"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">PIN Code</label>
                  <input type="text" name="pin" value={formData.pin} onChange={handleChange} placeholder="e.g. 110001"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-2">
                    Profile Avatar (Stored Exclusively in Cloudinary)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950/60 p-4 border border-zinc-800 rounded-2xl">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400/40 shrink-0 bg-zinc-900">
                      <img
                        src={formData.profilePhoto || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-3">
                        <label className={`cursor-pointer inline-flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-yellow-400 text-xs uppercase tracking-wider font-bold px-4 py-2.5 rounded-xl border border-zinc-700 transition-all ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {uploadingAvatar ? "Uploading to Cloudinary..." : "Upload Avatar Image"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            className="hidden"
                          />
                        </label>
                        {formData.profilePhoto && formData.profilePhoto.includes("cloudinary") && (
                          <span className="text-[10px] text-green-400 uppercase tracking-widest font-mono font-bold bg-green-950/40 border border-green-800 px-2 py-1 rounded-md">
                            ✓ Cloudinary Secured
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        name="profilePhoto"
                        value={formData.profilePhoto}
                        onChange={handleChange}
                        placeholder="https://res.cloudinary.com/..."
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-3 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ATHLETIC & DOSSIER METRICS */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Pitch Dossier & Physical Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Height (cm)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 176"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 73"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Dominant Foot</label>
                  <select name="dominantFoot" value={formData.dominantFoot} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm">
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Preferred Position</label>
                  <select name="preferredPosition" value={formData.preferredPosition} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm">
                    <option value="ST">ST (Striker)</option>
                    <option value="LW">LW (Left Wing)</option>
                    <option value="RW">RW (Right Wing)</option>
                    <option value="CAM">CAM (Central Attacking Midfielder)</option>
                    <option value="CM">CM (Central Midfielder)</option>
                    <option value="CDM">CDM (Central Defensive Midfielder)</option>
                    <option value="LB">LB (Left Back)</option>
                    <option value="RB">RB (Right Back)</option>
                    <option value="CB">CB (Center Back)</option>
                    <option value="GK">GK (Goalkeeper)</option>
                    <option value="WB">WB (Wing Back)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Fitness Level</label>
                  <select name="fitnessLevel" value={formData.fitnessLevel} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="recovery">Recovery</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Availability Status</label>
                  <select name="availability" value={formData.availability} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm">
                    <option value="available">Available for Trials / Transfers</option>
                    <option value="injured">Injured / Rehabilitation</option>
                    <option value="not-available">Not Available</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. CLUB & CAREER DETAILS */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                Club & Highlight Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Current Club</label>
                  <input type="text" name="currentClub" value={formData.currentClub} onChange={handleChange} placeholder="e.g. Liverpool"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Previous Club</label>
                  <input type="text" name="previousClub" value={formData.previousClub} onChange={handleChange} placeholder="e.g. Bayer 04 Leverkusen"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Preferred League</label>
                  <input type="text" name="preferredLeague" value={formData.preferredLeague} onChange={handleChange} placeholder="e.g. Premier League, ISL"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Highlight Video URL</label>
                  <input type="text" name="highlightVideo" value={formData.highlightVideo} onChange={handleChange} placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
              </div>
            </div>

            {/* 4. CAREER STATISTICS */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Season & Career Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Matches Played</label>
                  <input type="number" name="matchesPlayed" value={formData.matchesPlayed} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Goals</label>
                  <input type="number" name="goals" value={formData.goals} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Assists</label>
                  <input type="number" name="assists" value={formData.assists} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Clean Sheets</label>
                  <input type="number" name="cleanSheets" value={formData.cleanSheets} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
              </div>
            </div>

            {/* 5. EMERGENCY CONTACT */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Contact Name</label>
                  <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="e.g. John Doe"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Contact Phone</label>
                  <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="+91..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Relation</label>
                  <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} placeholder="e.g. Parent / Guardian"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
              </div>
            </div>

            {/* 6. SOCIAL HANDLES */}
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Social Handles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Instagram Profile</label>
                  <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Facebook Profile</label>
                  <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">YouTube Channel</label>
                  <input type="text" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
                </div>
              </div>
            </div>

            {/* 7. BIOGRAPHY */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Biography</label>
              <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} placeholder="Share your football journey, background, and ambitions..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white text-sm" />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${saving ? "opacity-75 cursor-not-allowed" : "hover:scale-[1.01]"
                }`}
            >
              <Save className="w-4 h-4 text-black" />
              <span>{saving ? "Saving Changes to Database..." : "Save Configuration"}</span>
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
