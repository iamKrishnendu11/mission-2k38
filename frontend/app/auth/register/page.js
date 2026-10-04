"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { FiEye, FiEyeOff } from "react-icons/fi";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleQuery = searchParams.get("role") || "player";
  const [role, setRole] = useState(roleQuery);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (roleQuery) setRole(roleQuery);
  }, [roleQuery]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    dob: "",
    ageCategory: "Senior",
    gender: "male",
    state: "Delhi",
    district: "New Delhi",
    city: "New Delhi",
    pin: "",
    bio: "",
    profilePhoto: "",

    // Player specific
    height: "",
    weight: "",
    dominantFoot: "right",
    preferredPosition: "ST",
    currentClub: "",
    previousClub: "",
    matchesPlayed: "0",
    goals: "0",
    assists: "0",
    cleanSheets: "0",
    preferredLeague: "ISL",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    instagram: "",
    facebook: "",
    youtube: "",
    governmentId: "",
    medicalHistory: "",
    fitnessLevel: "good",
    availability: "available",
    highlightVideo: "",

    // Scout specific
    organization: "",
    clubRepresenting: "",
    designation: "",
    license: "",
    areasOfInterest: "North India, Grassroots",
    ageGroupsCovered: "U-15, U-17, U-19",
    positionsInterested: "Striker, Center Back",

    // Coach specific
    experienceYears: "0",
    teamsManaged: "",
    specializations: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password || !formData.name) {
      setError("Email, Password, and Full Name are required.");
      setLoading(false);
      return;
    }

    try {
      // Split comma separated arrays
      const payload = {
        ...formData,
        role,
        // Scout arrays
        areasOfInterest: formData.areasOfInterest.split(",").map(s => s.trim()),
        ageGroupsCovered: formData.ageGroupsCovered.split(",").map(s => s.trim()),
        positionsInterested: formData.positionsInterested.split(",").map(s => s.trim()),
        // Coach arrays
        teamsManaged: formData.teamsManaged.split(",").map(s => s.trim()).filter(Boolean),
        specializations: formData.specializations.split(",").map(s => s.trim()).filter(Boolean),
      };

      const res = await api.post("/auth/register", payload);

      // Store session details
      api.setTokens(res.accessToken, res.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("profile", JSON.stringify(res.profile));

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.06),transparent_50%)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            Create your <span className="text-yellow-400">Mission 2K38</span> Profile
          </h2>
          <p className="mt-2 text-zinc-400">
            Join India's AI-Powered Grassroots Football Revolution.
          </p>
          <div className="mt-6 inline-flex p-1 rounded-md bg-zinc-900 border border-zinc-800">
            {["player", "scout", "coach"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 text-sm font-semibold rounded-md uppercase tracking-wider transition-all ${role === r
                    ? "bg-yellow-400 text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 md:p-10 shadow-2xl">

          <form onSubmit={handleRegister} className="space-y-8">
            {/* SECTION 1: COMMON CORE DETAILS */}
            <div>
              <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                Core Account Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Email Address *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 pr-10 text-white" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Age Category</label>
                  <select name="ageCategory" value={formData.ageCategory} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white">
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
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: GEOGRAPHIC LOCATION */}
            <div>
              <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                Location Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">PIN Code</label>
                  <input type="text" name="pin" value={formData.pin} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                </div>
              </div>
            </div>

            {/* SECTION 3: ROLE SPECIFIC FIELD GROUPS */}
            {role === "player" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                    Physical & Pitch Profiling
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Height (cm)</label>
                      <input type="number" name="height" value={formData.height} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Weight (kg)</label>
                      <input type="number" name="weight" value={formData.weight} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Dominant Foot</label>
                      <select name="dominantFoot" value={formData.dominantFoot} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white">
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Preferred Position</label>
                      <select name="preferredPosition" value={formData.preferredPosition} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white">
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
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                    Clubs & Career History
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Current Club</label>
                      <input type="text" name="currentClub" value={formData.currentClub} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Previous Club</label>
                      <input type="text" name="previousClub" value={formData.previousClub} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Preferred League</label>
                      <input type="text" name="preferredLeague" value={formData.preferredLeague} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                    Career Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Matches Played</label>
                      <input type="number" name="matchesPlayed" value={formData.matchesPlayed} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Goals Scored</label>
                      <input type="number" name="goals" value={formData.goals} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Assists Made</label>
                      <input type="number" name="assists" value={formData.assists} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Clean Sheets</label>
                      <input type="number" name="cleanSheets" value={formData.cleanSheets} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                    Social Handles & Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Instagram Link</label>
                      <input type="text" name="instagram" placeholder="https://instagram.com/..." value={formData.instagram} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">YouTube Channel</label>
                      <input type="text" name="youtube" placeholder="https://youtube.com/..." value={formData.youtube} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Profile Photo URL</label>
                      <input type="text" name="profilePhoto" placeholder="https://images.unsplash.com/..." value={formData.profilePhoto} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Contact Name</label>
                      <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Contact Phone</label>
                      <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Relation</label>
                      <input type="text" name="emergencyContactRelation" placeholder="e.g. Parent" value={formData.emergencyContactRelation} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === "scout" && (
              <div>
                <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                  Scout Organization & Targeting
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Organization / Agency</label>
                    <input type="text" name="organization" value={formData.organization} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Club Representing</label>
                    <input type="text" name="clubRepresenting" value={formData.clubRepresenting} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Designation</label>
                    <input type="text" name="designation" placeholder="e.g. Chief Scout" value={formData.designation} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Scouting License</label>
                    <input type="text" name="license" placeholder="e.g. AIFF Scout License B" value={formData.license} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Areas of Interest (comma-separated)</label>
                    <input type="text" name="areasOfInterest" value={formData.areasOfInterest} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold">
                        Age Groups Covered (Select Multiple)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const allGroups = ["U-13", "U-15", "U-17", "U-19", "U-21", "U-23", "Senior"];
                          const currentList = Array.isArray(formData.ageGroupsCovered)
                            ? formData.ageGroupsCovered
                            : (formData.ageGroupsCovered ? formData.ageGroupsCovered.split(",").map(s => s.trim()).filter(Boolean) : []);
                          const isAllSelected = allGroups.every(g => currentList.includes(g));
                          setFormData(prev => ({ ...prev, ageGroupsCovered: isAllSelected ? "" : allGroups.join(", ") }));
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 hover:underline bg-yellow-400/10 px-2.5 py-1 rounded border border-yellow-400/30 transition-all"
                      >
                        {(() => {
                          const allGroups = ["U-13", "U-15", "U-17", "U-19", "U-21", "U-23", "Senior"];
                          const currentList = Array.isArray(formData.ageGroupsCovered)
                            ? formData.ageGroupsCovered
                            : (formData.ageGroupsCovered ? formData.ageGroupsCovered.split(",").map(s => s.trim()).filter(Boolean) : []);
                          return allGroups.every(g => currentList.includes(g)) ? "Clear All" : "Select All";
                        })()}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded">
                      {["U-13", "U-15", "U-17", "U-19", "U-21", "U-23", "Senior"].map((group) => {
                        const currentList = Array.isArray(formData.ageGroupsCovered)
                          ? formData.ageGroupsCovered
                          : (formData.ageGroupsCovered ? formData.ageGroupsCovered.split(",").map(s => s.trim()).filter(Boolean) : []);
                        const isSelected = currentList.includes(group);

                        return (
                          <button
                            key={group}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? currentList.filter(g => g !== group)
                                : [...currentList, group];
                              setFormData(prev => ({ ...prev, ageGroupsCovered: updated.join(", ") }));
                            }}
                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all border ${
                              isSelected
                                ? "bg-yellow-400 text-black border-yellow-400"
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                            }`}
                          >
                            {group} {isSelected ? "✓" : "+"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 font-bold">
                        Positions Target (Select Multiple)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const allPos = ["ST", "LW", "RW", "CAM", "CM", "CDM", "LB", "RB", "CB", "GK", "WB"];
                          const currentList = Array.isArray(formData.positionsInterested)
                            ? formData.positionsInterested
                            : (formData.positionsInterested ? formData.positionsInterested.split(",").map(s => s.trim()).filter(Boolean) : []);
                          const isAllSelected = allPos.every(p => currentList.includes(p));
                          setFormData(prev => ({ ...prev, positionsInterested: isAllSelected ? "" : allPos.join(", ") }));
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:underline bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/30 transition-all"
                      >
                        {(() => {
                          const allPos = ["ST", "LW", "RW", "CAM", "CM", "CDM", "LB", "RB", "CB", "GK", "WB"];
                          const currentList = Array.isArray(formData.positionsInterested)
                            ? formData.positionsInterested
                            : (formData.positionsInterested ? formData.positionsInterested.split(",").map(s => s.trim()).filter(Boolean) : []);
                          return allPos.every(p => currentList.includes(p)) ? "Clear All" : "Select All";
                        })()}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded">
                      {["ST", "LW", "RW", "CAM", "CM", "CDM", "LB", "RB", "CB", "GK", "WB"].map((pos) => {
                        const currentList = Array.isArray(formData.positionsInterested)
                          ? formData.positionsInterested
                          : (formData.positionsInterested ? formData.positionsInterested.split(",").map(s => s.trim()).filter(Boolean) : []);
                        const isSelected = currentList.includes(pos);

                        return (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? currentList.filter(p => p !== pos)
                                : [...currentList, pos];
                              setFormData(prev => ({ ...prev, positionsInterested: updated.join(", ") }));
                            }}
                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all border ${
                              isSelected
                                ? "bg-amber-500 text-black border-amber-500"
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                            }`}
                          >
                            {pos} {isSelected ? "✓" : "+"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === "coach" && (
              <div>
                <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                  Coach License & Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Coaching License</label>
                    <input type="text" name="license" placeholder="e.g. AFC A License, UEFA Pro" value={formData.license} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Years of Experience</label>
                    <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Teams Managed (comma-separated)</label>
                    <input type="text" name="teamsManaged" placeholder="e.g. Delhi FC, Minerva Academy" value={formData.teamsManaged} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Coaching Specializations (comma-separated)</label>
                    <input type="text" name="specializations" placeholder="e.g. Goalkeeping, Tactical, Youth Drills" value={formData.specializations} onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Short Biography</label>
              <textarea name="bio" rows="4" placeholder="Tell scouts or the community about yourself..." value={formData.bio} onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded p-3 text-white" />
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Already have an account? Sign In
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-3 rounded-full font-bold uppercase tracking-wider text-black shadow-lg hover:scale-105 transition-all ${loading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? "Registering..." : "Submit Application"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-sm text-center font-medium shadow-lg">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Registration Form...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
