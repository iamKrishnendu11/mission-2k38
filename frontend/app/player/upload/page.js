"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { SlidingButton } from "@/app/login/components/SlidingButton";
import { UploadCloud, ChevronDown, AlertCircle, CheckCircle } from "lucide-react";

export default function UploadVideo() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [drillType, setDrillType] = useState("shooting");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File size exceeds 50MB limit.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    formData.append("drillType", drillType);

    try {
      await api.upload("/videos/upload", formData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/player/coach");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to upload video. Ensure backend server is active.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 pt-10">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white tracking-tight">Upload Session</h2>
          <p className="text-white/50 text-sm mt-2 font-medium">
            Submit video logs to kick off biomechanical analysis.
          </p>
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
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <span>Upload successful! Navigating to AI Coach...</span>
            </div>
          )}

          <form className="space-y-8">
            {/* FILE DROPZONE */}
            <div className="relative border border-dashed border-white/[0.1] hover:border-yellow-400/40 rounded-2xl p-10 text-center transition-all bg-[#0a0a0c]">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploading}
              />
              <div className="space-y-4 relative pointer-events-none">
                <div className="w-16 h-16 mx-auto bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  <UploadCloud className="w-8 h-8 text-yellow-400 drop-shadow-md" />
                </div>
                {file ? (
                  <div>
                    <h4 className="text-white font-bold text-sm">{file.name}</h4>
                    <p className="text-white/40 text-xs mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-white font-bold text-sm">Drag & Drop Video</h4>
                    <p className="text-white/40 text-xs mt-1">MP4, MOV, AVI up to 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Video Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Penalty Shootout Drill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  className="w-full bg-[#0a0a0c] border border-white/[0.04] focus:border-yellow-400/50 focus:outline-none rounded-xl p-4 text-white text-sm"
                />
              </div>

              <div className="relative">
                <label className="block text-[11px] uppercase tracking-widest text-white/50 font-bold mb-2">Drill Category</label>
                <div 
                  className={`w-full bg-[#0a0a0c] border ${dropdownOpen ? 'border-yellow-400/50' : 'border-white/[0.04]'} rounded-xl p-4 flex items-center justify-between cursor-pointer text-sm font-medium ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="text-white">
                    {drillType === 'shooting' && 'Shooting (Leg Flexion & Backswing)'}
                    {drillType === 'dribbling' && 'Dribbling (Ankle Proximity & Speed)'}
                    {drillType === 'goalkeeper' && 'Goalkeeping (Saves & Reaction)'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {dropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#121214] border border-white/[0.04] shadow-2xl rounded-xl overflow-hidden z-50">
                    {[
                      { id: 'shooting', label: 'Shooting (Leg Flexion & Backswing)' },
                      { id: 'dribbling', label: 'Dribbling (Ankle Proximity & Speed)' },
                      { id: 'goalkeeper', label: 'Goalkeeping (Saves & Reaction)' }
                    ].map((opt) => (
                      <div 
                        key={opt.id}
                        className="px-4 py-3 text-sm text-white/70 hover:bg-white/[0.04] hover:text-white cursor-pointer transition-colors"
                        onClick={() => {
                          setDrillType(opt.id);
                          setDropdownOpen(false);
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <SlidingButton 
                onClick={handleUpload}
                disabled={uploading || success}
                className="w-full h-14 font-black uppercase tracking-widest text-sm"
              >
                {uploading ? "Uploading..." : "Upload Session"}
              </SlidingButton>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
