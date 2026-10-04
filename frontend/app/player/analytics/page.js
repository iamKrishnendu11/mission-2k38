"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from "recharts";
import { TrendingUp, Award, Flame, Zap } from "lucide-react";

export default function PlayerAnalytics() {
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
        setError(err.message || "Failed to load analytics data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm tracking-widest font-bold uppercase">Plotting Performance Metrics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
          <h3 className="text-red-500 font-bold mb-2">Error Loading Analytics</h3>
          <p className="text-zinc-400">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

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

  // Trajectory history mockup (simulating weekly sessions)
  const trajectoryData = [
    { week: "Week 1", rating: 55 },
    { week: "Week 2", rating: 56 },
    { week: "Week 3", rating: 57 },
    { week: "Week 4", rating: skills.aiScore || 60 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-850 pb-4">
          <div>
            <h2 className="text-3xl font-black uppercase text-white tracking-widest">
              Performance Analytics
            </h2>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">
              AI Powered Bio-mechanical Assessment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* RADAR CHART PANEL */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 flex items-center gap-2">
                <Zap className="text-yellow-400 w-4 h-4" /> Attribute Assessment
              </h3>
              <p className="text-zinc-500 text-xs uppercase font-bold mb-6">Compare with grassroots national average</p>
            </div>
            
            <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={11} fontWeight="bold" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#52525b" />
                  <Radar name="My Skills" dataKey="A" stroke="#facc15" fill="#facc15" fillOpacity={0.2} />
                  <Radar name="National Avg" dataKey="B" stroke="#71717a" fill="#71717a" fillOpacity={0.15} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center space-x-6 text-xs mt-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block" />
                <span className="text-zinc-300 font-bold">My Skills</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-zinc-650 rounded-full inline-block" />
                <span className="text-zinc-500 font-bold">National Grassroots Average</span>
              </div>
            </div>
          </div>

          {/* TRAJECTORY WEEKLY PROGRESS */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 flex items-center gap-2">
                <TrendingUp className="text-yellow-400 w-4 h-4" /> AI Rating Trajectory
              </h3>
              <p className="text-zinc-500 text-xs uppercase font-bold mb-6">Historical rating growth across sessions</p>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#facc15" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" stroke="#71717a" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#71717a" domain={[40, 100]} fontSize={10} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="rating" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* COMPARATIVE BENCHMARK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Flame className="text-yellow-400 w-5 h-5" />
              <h4 className="text-sm font-bold uppercase text-white tracking-wider">Top Attributes</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your strongest performance fields are <strong className="text-white">Speed ({skills.speed || 60})</strong> and <strong className="text-white">Passing ({skills.passing || 60})</strong>. These ratings place you in the top 15% of your regional age cohort.
            </p>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="text-yellow-400 w-5 h-5" />
              <h4 className="text-sm font-bold uppercase text-white tracking-wider">Weekly Growth</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your rating has increased by <strong className="text-green-400">+3.8%</strong> this month. Work on tightening your ball-drift and completing the goalkeeper response drill to increase defensive markers.
            </p>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Award className="text-yellow-400 w-5 h-5" />
              <h4 className="text-sm font-bold uppercase text-white tracking-wider">Scouting Potential</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Based on your consistency metric of average backswing flexion during shots, the model projects your peak potential rating at <strong className="text-yellow-400">{skills.potential || 70}</strong>.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
