import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, TrendingUp, Compass, ChevronRight, Zap, Target, ShieldCheck } from "lucide-react";
import { User } from "../types";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

export default function CareerPage({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<string | null>(null);

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a senior career coach. Based on my profile, suggest 3 career paths and provide a detailed roadmap for the most suitable one.
        
        Profile:
        - Education: ${user.profile?.education || "N/A"}
        - Skills: ${user.profile?.skills?.join(", ") || "N/A"}
        - Interests: ${user.profile?.interests?.join(", ") || "N/A"}
        - Marks: ${user.profile?.marks || "N/A"}%
        
        Provide the response in Markdown format. Include:
        1. Recommended Path
        2. Required Skills & Tools
        3. Certifications to pursue
        4. Job Market Trends & Salary Insights
        5. AI/ML domain integration suggestions.`,
      });
      setRoadmap(response.text || "Failed to generate roadmap.");
    } catch (e) {
      console.error(e);
      setRoadmap("An error occurred while calling the AI. Please ensure your GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Hero Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-16 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[2.5px] border border-emerald-500/20 mb-8">
            <Sparkles size={14} className="animate-pulse" /> Precision Career Engine
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Navigate Your Future with <span className="text-emerald-400">AI Intelligence.</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10">
            Our neural-link analyzer processes 10,000+ data points from your academic profile to forge a personalized industry roadmap.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-10">
             {[
               { icon: Brain, label: "Neural Skill Map", color: "text-emerald-400" },
               { icon: TrendingUp, label: "Market Volatility Index", color: "text-blue-400" },
               { icon: Compass, label: "Global Domain Routing", color: "text-purple-400" }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2.5 rounded-2xl transition-colors hover:bg-white/10">
                 <item.icon size={18} className={item.color} />
                 <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
               </div>
             ))}
          </div>

          {!roadmap && (
            <button 
              onClick={generateRoadmap}
              disabled={loading}
              className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[3px] flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Synthesizing Data..." : "Generate Master Roadmap"}
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap size={18} /></motion.div> : <ChevronRight size={18} />}
            </button>
          )}
        </div>

        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Animated Brain Visual */}
        <div className="absolute top-1/2 right-12 lg:right-24 -translate-y-1/2 hidden xl:block">
           <div className="relative w-64 h-64 border border-white/5 rounded-full flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-dashed border-emerald-500/20 rounded-full"
              />
              <div className="w-48 h-48 bg-emerald-500/5 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center shadow-2xl">
                 <Brain size={80} className="text-emerald-400 opacity-40" />
              </div>
              <div className="absolute top-4 left-4 p-3 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl">
                 <Target className="text-blue-400" size={24} />
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {roadmap && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 lg:p-16 overflow-hidden relative"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-slate-100 pb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">AI Deployment Roadmap</h2>
                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-[2px] mt-2">Dynamic Logic Generated on {new Date().toLocaleDateString()}</p>
              </div>
              <button 
                onClick={generateRoadmap}
                className="text-xs font-black text-slate-400 hover:text-slate-900 flex items-center gap-2 uppercase tracking-widest transition-colors"
              >
                Regenerate Analytics <Zap size={14} className="text-yellow-500" />
              </button>
            </div>
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight prose-strong:text-slate-900 prose-p:text-slate-500 prose-p:leading-relaxed prose-li:text-slate-600">
              <div className="markdown-body">
                <ReactMarkdown>{roadmap}</ReactMarkdown>
              </div>
            </div>
            
            {/* Seal of Authenticity */}
            <div className="mt-16 flex items-center gap-3 grayscale opacity-30">
               <ShieldCheck size={24} className="text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Verified by AI Studio Education Node</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
