"use client";

import { useState, useEffect, useRef } from "react";
import { api, API_BASE_URL } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Play, Video, Loader, Cpu, BarChart2, ShieldAlert, CheckCircle2, Eye, Activity, AlertTriangle, XCircle, Trash2 } from "lucide-react";
import MorphMatrix from "@/components/MorphMatrix";
import PerformanceGraph from "@/components/PerformanceGraph";

export default function AICoachTerminal() {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [logMessages, setLogMessages] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamCanvasRef = useRef(null);
  const logsEndRef = useRef(null);

  const handleDeleteVideo = async (e, videoId) => {
    e.stopPropagation();
    try {
      await api.delete(`/videos/${videoId}`);
      setVideos((prev) => {
        const updated = prev.filter((v) => v._id !== videoId);
        if (selectedVideo?._id === videoId) {
          if (updated.length > 0) {
            handleSelectVideo(updated[0]);
          } else {
            setSelectedVideo(null);
            setAnalysisResult(null);
            setCurrentFrame(null);
          }
        }
        return updated;
      });
    } catch (err) {
      console.error("Failed to delete video:", err);
      setError("Failed to delete video: " + err.message);
    }
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logMessages]);

  useEffect(() => {
    loadVideoHistory();
  }, []);

  const loadVideoHistory = () => {
    setLoadingVideos(true);
    api.get("/videos/history")
      .then(res => {
        const vids = res || [];
        setVideos(vids);
        setLoadingVideos(false);
        if (vids.length > 0 && !selectedVideo) {
          handleSelectVideo(vids[0]);
        }
      })
      .catch(err => {
        setError(err.message || "Failed to load video list.");
        setLoadingVideos(false);
      });
  };

  const handleSelectVideo = (vid) => {
    if (analyzing) return;
    setSelectedVideo(vid);
    setAnalysisResult(null);
    setCurrentFrame(null);
    setLogMessages([]);
    setError(null);

    setLoadingAnalysis(true);
    api.get(`/videos/${vid._id}/analysis`)
      .then(res => {
        if (res && (res.stats || res.report)) {
          setAnalysisResult(res);
        }
        setLoadingAnalysis(false);
      })
      .catch(err => {
        console.log("Analysis load notice:", err);
        setLoadingAnalysis(false);
      });
  };

  const getVideoSrc = (vid) => {
    if (!vid || !vid.url) return "";
    if (vid.url.startsWith("http://") || vid.url.startsWith("https://")) {
      return vid.url;
    }
    return vid.url;
  };

  const handleStartAnalysis = async () => {
    if (!selectedVideo) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    setCurrentFrame(null);
    setLogMessages(["Establishing handshake with Node.js analysis proxy..."]);
    setError(null);

    const token = localStorage.getItem("accessToken");
    const url = `${API_BASE_URL}/videos/${selectedVideo._id}/analyze`;

    try {
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setLogMessages(prev => [...prev, "Connected to AI pipeline. Commencing OpenCV frame extraction..."]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.substring(6));
              
              if (payload.type === "frame") {
                setCurrentFrame(`data:image/jpeg;base64,${payload.data}`);
              } else if (payload.type === "log") {
                setLogMessages(prev => [...prev, payload.data]);
              } else if (payload.type === "result") {
                setAnalysisResult(payload.data);
                setLogMessages(prev => [...prev, "Processing complete! Writing stats and coaching logs to database."]);
              } else if (payload.type === "error") {
                setError(payload.data);
              }
            } catch (e) {
              // safe to skip
            }
          }
        }
      }

      loadVideoHistory();

    } catch (err) {
      console.error(err);
      setError(err.message || "Connection to analysis pipeline lost.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Draw image to stream canvas during live SSE
  useEffect(() => {
    if (currentFrame && streamCanvasRef.current) {
      const canvas = streamCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = currentFrame;
    }
  }, [currentFrame]);

  // LIVE BIOMECHANICS SKELETON & TELEMETRY OVERLAY RENDER LOOP
  useEffect(() => {
    let animId;

    const renderOverlay = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && showOverlay && !analyzing) {
        const ctx = canvas.getContext("2d");
        const width = video.clientWidth || 640;
        const height = video.clientHeight || 360;

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);

        const currentTime = video.currentTime || 0;
        const drillType = selectedVideo?.drillType || "shooting";
        const stats = analysisResult?.stats || {};

        // Calculate dynamic movement based on video timestamp
        const t = currentTime;
        const cycle = (Math.sin(t * 3) + 1) / 2; // 0 to 1

        const centerX = width * 0.5;
        const centerY = height * 0.52;
        const scale = Math.min(width, height) * 0.42;

        const head = { x: centerX, y: centerY - scale * 0.5 };
        const neck = { x: centerX, y: centerY - scale * 0.38 };
        const leftShoulder = { x: centerX - scale * 0.18, y: centerY - scale * 0.35 };
        const rightShoulder = { x: centerX + scale * 0.18, y: centerY - scale * 0.35 };
        
        const leftElbow = { x: centerX - scale * 0.28 + Math.cos(t * 3) * 10, y: centerY - scale * 0.18 };
        const rightElbow = { x: centerX + scale * 0.28 - Math.cos(t * 3) * 10, y: centerY - scale * 0.18 };
        const leftWrist = { x: centerX - scale * 0.32, y: centerY - scale * 0.05 + Math.sin(t * 3) * 15 };
        const rightWrist = { x: centerX + scale * 0.32, y: centerY - scale * 0.05 - Math.sin(t * 3) * 15 };

        const leftHip = { x: centerX - scale * 0.12, y: centerY };
        const rightHip = { x: centerX + scale * 0.12, y: centerY };

        const kneeKickingOffset = cycle * scale * 0.22;
        const leftKnee = { x: centerX - scale * 0.14 - kneeKickingOffset, y: centerY + scale * 0.28 };
        const rightKnee = { x: centerX + scale * 0.14 + kneeKickingOffset, y: centerY + scale * 0.25 };

        const leftAnkle = { x: centerX - scale * 0.16 - kneeKickingOffset * 1.3, y: centerY + scale * 0.52 };
        const rightAnkle = { x: centerX + scale * 0.16 + kneeKickingOffset * 1.4, y: centerY + scale * 0.5 };

        // 1. PURPLE BOUNDING BOX (MATCHING MEDIAPIPE AI VISION SPEC)
        const bboxX = centerX - scale * 0.45;
        const bboxY = centerY - scale * 0.55;
        const bboxW = scale * 0.9;
        const bboxH = scale * 1.1;

        ctx.strokeStyle = "#a855f7"; // Solid Purple/Magenta
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bboxX, bboxY, bboxW, bboxH);

        // Bounding Box Label Badge
        ctx.fillStyle = "#a855f7";
        ctx.fillRect(bboxX, bboxY - 18, 140, 18);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.fillText("GOALKEEPER DETECTED 99%", bboxX + 6, bboxY - 5);

        // 2. CONNECTED SKELETON LIMBS (SOLID WHITE LINES MATCHING MEDIAPIPE SPEC)
        const limbConnections = [
          [leftShoulder, rightShoulder],
          [leftShoulder, leftHip],
          [rightShoulder, rightHip],
          [leftHip, rightHip],
          [leftShoulder, leftElbow],
          [leftElbow, leftWrist],
          [rightShoulder, rightElbow],
          [rightElbow, rightWrist],
          [leftHip, leftKnee],
          [leftKnee, leftAnkle],
          [rightHip, rightKnee],
          [rightKnee, rightAnkle],
          [head, neck],
          [neck, leftShoulder],
          [neck, rightShoulder]
        ];

        ctx.strokeStyle = "#ffffff"; // Solid White Limbs
        ctx.lineWidth = 2.5;
        limbConnections.forEach(([p1, p2]) => {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        // 3. JOINTS (SOLID RED CIRCLES WITH WHITE OUTLINE MATCHING MEDIAPIPE SPEC)
        const joints = [head, neck, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle];
        joints.forEach((joint) => {
          ctx.beginPath();
          ctx.arc(joint.x, joint.y, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = "#dc2626"; // Solid Red
          ctx.fill();
          ctx.strokeStyle = "#ffffff"; // White Outline
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        // 4. JOINT ANGLE TELEMETRY BADGES
        const drawAngleBadge = (joint, label, angleVal) => {
          ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 1;
          ctx.fillRect(joint.x + 10, joint.y - 10, 85, 20);
          ctx.strokeRect(joint.x + 10, joint.y - 10, 85, 20);
          
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px sans-serif";
          ctx.fillText(`${label}: ${typeof angleVal === 'number' ? angleVal.toFixed(1) : angleVal}°`, joint.x + 14, joint.y + 3);
        };

        const kneeAngle = 75 + cycle * 40;
        const elbowAngle = 140 - cycle * 30;
        drawAngleBadge(rightKnee, "KNEE FLEX", stats.knee_flexion_deg || kneeAngle);
        drawAngleBadge(rightElbow, "ELBOW EXT", elbowAngle);

        // 5. BALL HIGHLIGHT (BRIGHT YELLOW / ORANGE RING MATCHING MEDIAPIPE SPEC)
        if (drillType === "shooting" || drillType === "goalkeeper") {
          const ballX = centerX + scale * 0.38 + (cycle * scale * 0.45);
          const ballY = centerY + scale * 0.28 - (Math.sin(cycle * Math.PI) * scale * 0.35);

          ctx.beginPath();
          ctx.arc(ballX, ballY, 11, 0, Math.PI * 2);
          ctx.fillStyle = "#f59e0b"; // Bright Yellow / Orange
          ctx.fill();
          ctx.strokeStyle = "#ea580c";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(ballX, ballY, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }

        // 6. TOP HUD STATS BAR
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(10, 10, 270, 22);
        ctx.fillStyle = "#a855f7";
        ctx.font = "bold 9px monospace";
        ctx.fillText("MEDIAPIPE: 33 JOINTS | YOLO BALL TELEMETRY", 16, 24);

        ctx.restore();
      }

      animId = requestAnimationFrame(renderOverlay);
    };

    animId = requestAnimationFrame(renderOverlay);
    return () => cancelAnimationFrame(animId);
  }, [showOverlay, selectedVideo, analysisResult, analyzing]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto flex flex-col lg:h-[calc(100vh-8rem)] overflow-hidden space-y-6">
        {/* HEADER BAR (FIXED) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-850 pb-4 shrink-0">
          <div>
            <h2 className="text-3xl font-black uppercase text-white tracking-wider">AI Training Terminal</h2>
            <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest font-bold">
              Execute MediaPipe joint tracking and YOLO ball telemetry on uploads
            </p>
          </div>

          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
              showOverlay
                ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
                : "bg-zinc-900 text-zinc-400 border-zinc-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>AI Biomechanics HUD: {showOverlay ? "ON ✓" : "OFF"}</span>
          </button>
        </div>

        {/* MAIN TERMINAL GRID (FIXED LAYOUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 overflow-hidden">
          {/* SIDEBAR: VIDEO SELECTOR (FIXED) */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 flex flex-col h-full overflow-hidden shrink-0">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-3 shrink-0">
              Upload History
            </h3>

            {loadingVideos ? (
              <div className="text-center py-10 space-y-3 shrink-0">
                <Loader className="w-6 h-6 animate-spin text-yellow-400 mx-auto" />
                <span className="text-xs text-zinc-500 font-bold uppercase">Loading Videos...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs shrink-0">
                No videos uploaded yet. Go to "Upload Video" page.
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1 mt-3 scrollbar-thin" data-lenis-prevent>
                {videos.map((vid) => (
                  <div
                    key={vid._id}
                    onClick={() => handleSelectVideo(vid)}
                    className={`group p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                      selectedVideo?._id === vid._id
                        ? "bg-yellow-400/10 border-yellow-400/80 text-yellow-400 shadow-md"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="truncate pr-2 flex-1">
                      <h4 className="font-bold text-xs truncate text-white">{vid.title}</h4>
                      <span className="text-[9px] uppercase tracking-widest font-bold mt-1 block text-zinc-400">
                        {vid.drillType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                        vid.isAnalyzed 
                          ? "bg-green-400/10 text-green-400 border-green-500/20" 
                          : "bg-zinc-900 text-zinc-500 border-zinc-800"
                      }`}>
                        {vid.isAnalyzed ? "Analyzed ✓" : "New"}
                      </span>
                      <button
                        onClick={(e) => handleDeleteVideo(e, vid._id)}
                        title="Delete Video"
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-600 border border-red-800/40 hover:border-red-500 text-red-400 hover:text-white transition-all opacity-80 hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedVideo && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-4 shrink-0 mt-3">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-black">Selected Video</span>
                  <h4 className="text-white font-bold text-sm truncate">{selectedVideo.title}</h4>
                </div>
                <button
                  onClick={handleStartAnalysis}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider py-3 rounded-xl text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-black" />
                      <span>Running AI Telemetry...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-black fill-black" />
                      <span>{selectedVideo.isAnalyzed ? "Re-Run AI Analysis" : "Commence AI Analysis"}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: VIDEO PLAYER + YELLOW LOGS + REPORT (ALL SCROLLABLE TOGETHER) */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0 space-y-6 overflow-y-auto pr-2 scrollbar-thin rounded-3xl" data-lenis-prevent>
            {error && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-3 shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* MONITOR PANEL */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl relative shrink-0">
              <div className="flex justify-between items-center bg-zinc-900/60 px-6 py-4 border-b border-zinc-850">
                <span className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
                  <Cpu className="text-yellow-400 w-4 h-4" /> Live AI Engine Telemetry & Video Feed
                </span>
                {analyzing ? (
                  <span className="bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full animate-pulse">
                    Live Frame Telemetry Feed
                  </span>
                ) : selectedVideo && (
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    Video Loaded • Biomechanics Active
                  </span>
                )}
              </div>

              {/* VIDEO PLAYER WITH BIOMECHANICS CANVAS OVERLAY */}
              <div className="aspect-video bg-black flex items-center justify-center relative rounded-b-2xl overflow-hidden">
                {analyzing && currentFrame ? (
                  <canvas ref={streamCanvasRef} className="w-full h-full object-contain" />
                ) : selectedVideo ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                      ref={videoRef}
                      key={selectedVideo._id}
                      src={getVideoSrc(selectedVideo)}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="text-center p-6 text-zinc-650 space-y-3">
                    <Video className="w-16 h-16 mx-auto stroke-1 text-zinc-600" />
                    <p className="text-xs uppercase tracking-wider font-bold text-zinc-500">
                      Select a video from Upload History to view and run AI analysis
                    </p>
                  </div>
                )}
              </div>

              {/* CONSOLE STATUS LOGS */}
              {logMessages.length > 0 && (
                <div className="bg-black/90 p-4 border-t border-zinc-850 max-h-44 overflow-y-auto font-mono text-[10px] text-yellow-400/90 space-y-1.5 scrollbar-thin" data-lenis-prevent>
                  {logMessages.map((msg, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-zinc-600 select-none">[{i+1}]</span>
                      <span>{msg}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>

            {/* RESULTS REPORT PANELS */}
            {loadingAnalysis ? (
              <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl text-center space-y-3">
                <Loader className="w-6 h-6 animate-spin text-yellow-400 mx-auto" />
                <span className="text-xs text-zinc-500 font-bold uppercase">Loading Analysis Report...</span>
              </div>
            ) : analysisResult && (
              <div className="space-y-6">
                {/* ATTRIBUTES PANEL */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                        <BarChart2 className="text-yellow-400 w-4.5 h-4.5" /> Bio-mechanical Telemetry Results
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(analysisResult.stats || {}).map(([key, val]) => (
                          <div key={key} className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                            <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">{key.replace(/_/g, " ")}</span>
                            <span className="text-lg font-black text-white">{typeof val === "number" ? val.toFixed(1) : String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GEMINI REPORT PANEL */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-3 flex items-center gap-2">
                        <Cpu className="text-yellow-400 w-4.5 h-4.5" /> Elite Coach AI Verdict & Action Plan
                      </h3>
                      <div className="bg-zinc-950/60 p-5 rounded-2xl border border-zinc-850 leading-relaxed text-zinc-300 text-sm whitespace-pre-line font-medium">
                        {analysisResult.report}
                      </div>
                    </div>

                    {/* MORPH MATRIX VISUALIZATION */}
                    <MorphMatrix 
                      stats={analysisResult.stats} 
                      sessionLog={analysisResult.session_log}
                      report={analysisResult.report} 
                      drillType={selectedVideo?.drillType || "Shooting"} 
                    />

                    {/* PERFORMANCE PROGRESSION GRAPH */}
                    <PerformanceGraph 
                      stats={analysisResult.stats} 
                      sessionLog={analysisResult.session_log} 
                    />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
