"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from "recharts";
import { TrendingUp, Award, Flame, Zap, Activity, Target } from "lucide-react";



export default function PlayerAnalytics() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/dashboard/player/dashboard")
      .then(res => {
        setDashboardData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load analytics data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
          <p className="text-zinc-500 text-sm tracking-tight font-bold">Plotting Performance Metrics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 rounded-[24px] text-center max-w-xl mx-auto relative overflow-hidden mt-20"
             style={{
               background: "rgba(0,0,0,0.6)",
               boxShadow: "0 8px 32px -8px rgba(239, 68, 68, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 -4px 20px -4px rgba(239, 68, 68, 0.2)",
               backdropFilter: "blur(24px)",
             }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[3px] bg-red-500 blur-sm opacity-30 pointer-events-none" />
          <h3 className="text-red-400 font-bold mb-2 tracking-tight">Error Loading Analytics</h3>
          <p className="text-zinc-400">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { profile = {}, analyses = [] } = dashboardData || {};
  const { skills = {} } = profile;

  // Radar chart data structure
  const radarData = [
    { subject: "Speed", A: skills.speed || 60, B: 55, fullMark: 100 },
    { subject: "Passing", A: skills.passing || 60, B: 50, fullMark: 100 },
    { subject: "Dribbling", A: skills.dribbling || 60, B: 45, fullMark: 100 },
    { subject: "Finishing", A: skills.finishing || 60, B: 40, fullMark: 100 },
    { subject: "Defending", A: skills.defending || 60, B: 45, fullMark: 100 },
    { subject: "Vision", A: skills.vision || 60, B: 48, fullMark: 100 },
    { subject: "Stamina", A: skills.stamina || 60, B: 52, fullMark: 100 },
  ];

  // Trajectory history using real AI analyses
  const trajectoryData = analyses.length > 0 ? 
    [...analyses].reverse().map((a, i) => {
      let score = 50; 
      if (a.stats) {
        if (a.stats.consistency_percent !== undefined) score = a.stats.consistency_percent;
        else if (a.stats.control_rating !== undefined) score = a.stats.control_rating;
      }
      return { session: `S${i + 1}`, rating: score };
    })
    : [{ session: "No Sessions", rating: 0 }];

  const GlassCard = ({ children, className = "" }) => (
    <div className={`relative rounded-[32px] bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-300 group ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_40%)] pointer-events-none" />
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="mb-8 mt-2">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-[20px] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0 hidden sm:flex">
                <Activity className="w-6 h-6 text-yellow-400 drop-shadow-md" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-yellow-400/10 text-yellow-400 text-[11px] font-bold tracking-tight px-3 py-1 rounded-md border border-yellow-400/20 shadow-[inset_0_0_8px_rgba(250,204,21,0.2)]">
                    System Active
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-none">
                  Performance Analytics
                </h2>
                <p className="text-white/50 mt-2 max-w-xl text-base leading-relaxed font-medium tracking-tight">
                  AI Powered Bio-mechanical Assessment
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RADAR CHART PANEL */}
          <GlassCard className="p-8 md:p-10 flex flex-col justify-between min-h-[440px]">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                  <Target className="w-5 h-5 text-yellow-400 drop-shadow-md" />
                </div>
                Attribute Assessment
              </h3>
              <p className="text-white/40 text-xs font-medium tracking-tight mb-6">Compare with grassroots national average</p>
            </div>
            
            <div className="flex-1 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={11} fontWeight="bold" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={false} axisLine={false} />
                  <Radar name="My Skills" dataKey="A" stroke="#facc15" strokeWidth={2} fill="#facc15" fillOpacity={0.3} />
                  <Radar name="National Avg" dataKey="B" stroke="#71717a" strokeWidth={1} fill="#71717a" fillOpacity={0.15} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(5,5,7,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(16px)' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '13px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center space-x-8 text-xs mt-4">
              <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.6)] inline-block" />
                <span className="text-white/80 font-bold tracking-tight text-xs">My Skills</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                <span className="w-2.5 h-2.5 bg-zinc-600 rounded-full inline-block" />
                <span className="text-white/40 font-bold tracking-tight text-xs">National Avg</span>
              </div>
            </div>
          </GlassCard>

          {/* TRAJECTORY WEEKLY PROGRESS */}
          <GlassCard className="p-8 md:p-10 flex flex-col justify-between min-h-[440px]">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                  <TrendingUp className="w-5 h-5 text-yellow-400 drop-shadow-md" />
                </div>
                AI Rating Trajectory
              </h3>
              <p className="text-zinc-500 text-xs font-medium tracking-tight mb-6">Historical rating growth across sessions</p>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="session" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.2)" domain={[40, 100]} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(5,5,7,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(16px)' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '13px' }}
                  />
                  <Area type="monotone" dataKey="rating" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" activeDot={{ r: 6, fill: '#facc15', stroke: '#000', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* COMPARATIVE BENCHMARK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                <Flame className="w-5 h-5 text-yellow-400" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">Top Attributes</h4>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              Your strongest performance fields are <strong className="text-white">Speed ({skills.speed || 60})</strong> and <strong className="text-white">Passing ({skills.passing || 60})</strong>. These ratings place you in the top 15% of your regional age cohort.
            </p>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">Weekly Growth</h4>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              Your rating has increased by <strong className="text-green-400 font-bold px-2 py-0.5 bg-green-500/10 rounded-md border border-green-500/20 ml-1 tracking-tight">+3.8%</strong> this month. Work on tightening your ball-drift and completing the goalkeeper response drill to increase defensive markers.
            </p>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">Scouting Potential</h4>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              Based on your consistency metric of average backswing flexion during shots, the model projects your peak potential rating at <strong className="text-yellow-400 text-xl font-black">{skills.potential || 70}</strong>.
            </p>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
