"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { UploadCloud, Video, AlertCircle, CheckCircle } from "lucide-react";

export default function UploadVideo() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [drillType, setDrillType] = useState("shooting");
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
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-black uppercase text-white tracking-wider">Upload Training Video</h2>
          <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold">
            Submit video session logs to kick off AI analysis
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
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <span>Upload successful! Navigating to AI Coach...</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            {/* FILE DROPZONE */}
            <div className="relative border-2 border-dashed border-zinc-800 hover:border-yellow-400/40 rounded-2xl p-10 text-center transition-all bg-zinc-950/40">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="space-y-4">
                <UploadCloud className="w-12 h-12 text-zinc-650 mx-auto" />
                {file ? (
                  <div>
                    <h4 className="text-white font-bold text-sm">{file.name}</h4>
                    <p className="text-zinc-500 text-xs mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-white font-bold text-sm">Drag and drop your video file here</h4>
                    <p className="text-zinc-500 text-xs mt-1">Accepts MP4, MOV, AVI up to 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Video Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Penalty Shootout Drill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Drill Category</label>
                <select
                  value={drillType}
                  onChange={(e) => setDrillType(e.target.value)}
                  disabled={uploading}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400 focus:outline-none rounded-xl p-4 text-white"
                >
                  <option value="shooting">Shooting (Leg Flexion & Backswing)</option>
                  <option value="dribbling">Dribbling (Ankle Proximity & Speed)</option>
                  <option value="goalkeeper">Goalkeeping (Saves & Reaction Time)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || success}
              className={`w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all ${
                uploading ? "opacity-75 cursor-not-allowed" : "hover:scale-[1.01]"
              }`}
            >
              {uploading ? "Uploading Video..." : "Upload to Server"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
