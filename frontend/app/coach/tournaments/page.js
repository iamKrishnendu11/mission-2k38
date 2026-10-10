"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, Calendar, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { SlidingButton } from "@/app/login/components/SlidingButton";

export default function CoachTournaments() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    lat: "28.6139", // Delhi defaults
    lng: "77.2090",
    maxTeams: "16"
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

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
      await api.post("/tournaments", formData);
      setSuccess(true);
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        lat: "28.6139",
        lng: "77.2090",
        maxTeams: "16"
      });
    } catch (err) {
      setError(err.message || "Failed to create tournament.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 px-4 md:px-0">
        <div className="flex items-center gap-4 border-b border-white/[0.04] pb-6 pt-10">
          <div className="w-14 h-14 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
            <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-md" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Host Tournament</h2>
            <p className="text-white/50 text-sm mt-1 font-medium">
              Create scout-monitored local leagues and draft tryouts
            </p>
          </div>
        </div>

        <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[32px] p-8 md:p-10 backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-950/40 border border-green-500/50 flex items-center gap-3 text-green-200 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <span>Tournament created successfully and listed on dashboard!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Tournament Title</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Grassroots Sub-Junior Delhi Cup"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
                className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl p-4 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Short Description</label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe league brackets, scouts attending, etc..."
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
                className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl p-4 text-white text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl p-4 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl p-4 text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Venue Location Address</label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Ambedkar Stadium, Delhi"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl p-4 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Max Team Capacity</label>
                <input
                  type="number"
                  name="maxTeams"
                  required
                  value={formData.maxTeams}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl p-4 text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-white/[0.04] pt-6 mt-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/40 font-bold mb-2">Simulated Latitude (GPS)</label>
                <input type="text" name="lat" value={formData.lat} onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl p-3 text-white text-sm" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/40 font-bold mb-2">Simulated Longitude (GPS)</label>
                <input type="text" name="lng" value={formData.lng} onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl p-3 text-white text-sm" />
              </div>
            </div>

            <div className="pt-2">
              <SlidingButton
                onClick={handleSubmit}
                disabled={saving}
                className="w-full h-14 font-black uppercase tracking-widest text-sm"
              >
                {saving ? "Registering Tournament..." : "Host Tournament League"}
              </SlidingButton>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
