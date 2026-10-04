"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, Calendar, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

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
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-black uppercase text-white tracking-wider">Host Tournament</h2>
          <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold">
            Create scout-monitored local leagues and draft tryouts
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
              <span>Tournament created successfully and listed on dashboard!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Tournament Title</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Grassroots Sub-Junior Delhi Cup"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Short Description</label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe league brackets, scouts attending, etc..."
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Venue Location Address</label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Ambedkar Stadium, Delhi"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Max Team Capacity</label>
                <input
                  type="number"
                  name="maxTeams"
                  required
                  value={formData.maxTeams}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-zinc-850 pt-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-505 font-bold mb-2">Simulated Latitude (GPS)</label>
                <input type="text" name="lat" value={formData.lat} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-3 text-white text-xs" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-505 font-bold mb-2">Simulated Longitude (GPS)</label>
                <input type="text" name="lng" value={formData.lng} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-3 text-white text-xs" />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider py-4 rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-black" />
              <span>{saving ? "Registering Tournament..." : "Host Tournament League"}</span>
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
