import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Lightbulb, ArrowUpRight, TrendingUp, Inbox, Target, Zap, Sparkles, Globe } from "lucide-react";
import { User, Scholarship, Project } from "../types";
import { api } from "../api";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function DashboardPage({ user }: { user: User }) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<{ career: string, scholarship: string } | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [sData, pData] = await Promise.all([
          api.scholarships.list(),
          api.projects.list()
        ]);
        setScholarships(Array.isArray(sData) ? sData.slice(0, 3) : []);
        setProjects(Array.isArray(pData) ? pData.filter((p: any) => p.userId === user.id || p.userId === 'admin').slice(0, 2) : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
    
    // Simulating Live Insights from search data
    setInsights({
      career: "Demand for AI Analysts & Sustainability Consultants in India is projected to grow by 40% by 2025.",
      scholarship: "Reliance Foundation and HDFC Parivartan have opened 2024-25 application windows for UG/PG students."
    });
  }, [user.id]);

  return (
    <div className="space-y-8">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Scholarships Found</p>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={14} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 flex items-baseline gap-2">
            24 
            <span className="text-xs font-bold text-emerald-600 tracking-tight">+3 new today</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">Matched to your academic profile</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Active Applications</p>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Inbox size={14} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">08</h3>
          <p className="text-[11px] text-orange-500 mt-2 font-bold flex items-center gap-1">
             <Target size={12} /> 2 deadlines approaching this week
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">EDC Prototypes</p>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Lightbulb size={14} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{projects.length.toString().padStart(2, '0')}</h3>
          <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-1 italic">
            {projects.map(p => p.title).join(", ") || "No active projects"}
          </p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Intelligence Feed */}
        {insights && (
          <div className="lg:col-span-12">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-emerald-900 p-6 rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden"
            >
               <div className="flex items-center gap-4 shrink-0">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Sparkles className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-[2px]">Market Intelligence</h4>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1 tracking-widest">Live Strategic Feed</p>
                  </div>
               </div>

               <div className="flex-1 grid md:grid-cols-2 gap-8 relative z-10">
                  <div className="flex gap-4">
                    <Globe className="text-emerald-500 shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Career Trends</p>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed italic">"{insights.career}"</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Target className="text-emerald-500 shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Scholarship Pulse</p>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed italic">"{insights.scholarship}"</p>
                    </div>
                  </div>
               </div>

               {/* Background elements */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </motion.div>
          </div>
        )}

        {/* Main Recommendations Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <GraduationCap className="text-emerald-500 w-5 h-5" />
               <h4 className="font-bold text-slate-800 tracking-tight">Recommended Scholarships</h4>
            </div>
            <Link to="/scholarships" className="text-xs text-emerald-600 font-extrabold hover:underline uppercase tracking-wider">View All Matching</Link>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                  <th className="px-6 py-4">Provider & Name</th>
                  <th className="px-6 py-4 text-center">Amount</th>
                  <th className="px-6 py-4">Eligibility</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic font-sans not-italic">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-6 animate-pulse bg-slate-50/50" />
                    </tr>
                  ))
                ) : scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-slate-800">{s.title}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Govt of India · Education Department</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm border border-emerald-100/50 ring-1 ring-emerald-500/10">
                        ₹{(Number(s.amount) || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] text-slate-600 font-bold bg-slate-100 w-fit px-2 py-0.5 rounded uppercase">{s.course?.[0] || 'UG'}+ {s.eligibility?.marks || 0}% Marks</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[11px] font-black text-emerald-600 uppercase tracking-widest p-2 hover:bg-emerald-50 rounded-lg transition-all">
                        Apply <ArrowUpRight size={12} className="inline ml-0.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Career & Spotlight Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden group">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h4 className="font-bold text-slate-800 tracking-tight">AI Path Roadmap</h4>
            </div>
            <div className="p-6 space-y-5">
              <div className="relative flex gap-4 items-start">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div className="flex-1 pb-4 border-b border-slate-50">
                  <h5 className="text-[10px] font-black uppercase tracking-[1px] text-slate-400 mb-1">Current Step</h5>
                  <p className="text-sm font-bold text-slate-800">{user.profile?.skills?.[0] || "Python"} Mastery</p>
                  <p className="text-[11px] text-slate-500 font-medium">Complete Industry Certification</p>
                </div>
              </div>
              <div className="relative flex gap-4 items-start opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                <div className="flex-1">
                  <h5 className="text-[10px] font-black uppercase tracking-[1px] text-slate-400 mb-1">Next Milestone</h5>
                  <p className="text-sm font-bold text-slate-800">Advanced Algorithms</p>
                </div>
              </div>
              <Link to="/career" className="w-full py-2.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[2px] rounded-xl shadow-lg shadow-slate-200 flex justify-center items-center gap-2 hover:bg-slate-800 transition-all">
                Resume Roadmap <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-7 text-white relative overflow-hidden group shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[3px]">EDC Spotlight</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <h4 className="text-xl font-bold mt-1 tracking-tight">Funding Round Open</h4>
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed font-medium">Submit your prototype for the National Startup Fund by Sep 20. Grants up to ₹5L available.</p>
              <div className="flex gap-2 mt-6">
                <Link to="/projects" className="flex-1 bg-emerald-500 text-white text-[11px] font-black py-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest">
                   Submit <Plus size={14} />
                </Link>
                <button className="flex-1 border border-white/20 text-white text-[11px] font-black py-3 rounded-xl hover:bg-white/5 transition-all uppercase tracking-widest">
                  Mentors
                </button>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus({ size = 16, className = "" }: { size?: number, className?: string }) {
  return <Zap size={size} className={className} />;
}
