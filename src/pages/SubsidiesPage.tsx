import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ArrowUpRight, Search, Zap, Globe, ShieldCheck, ChevronRight, Sparkles, Loader2, Link as LinkIcon, Compass } from "lucide-react";
import { Subsidy, User } from "../types";
import { api } from "../api";
import { cn } from "../lib/utils";
import { GoogleGenAI, Type } from "@google/genai";

export default function SubsidiesPage({ user }: { user: User }) {
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  // Profile shortcuts
  const userCategory = user.profile?.category || "General";
  const userState = user.profile?.domicileState || "India";
  const userEdu = user.profile?.currentCourse?.courseName || user.profile?.education || "Student";
  const userIncome = user.profile?.parentalIncome || user.profile?.income || "Standard";

  useEffect(() => {
    api.subsidies.list().then(setSubsidies).finally(() => setLoading(false));
  }, []);

  const searchAISubsidies = async () => {
    setIsSearchingAI(true);
    setAiResults([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `Find 4-5 real, currently active government subsidies, grants, or seed funding opportunities for a Indian student entrepreneur with these profile details:
      - Category: ${userCategory}
      - State of Domicile: ${userState}
      - Qualification: ${userEdu}
      - Family Income: ₹${userIncome}
      
      Requirements:
      1. Focus on "Startup India" related state/central grants (e.g., SISFS, State Startup Seed Funds).
      2. Identify incubation programs with maintenance allowances.
      3. For woman entrepreneurs (if gender matches) or specific categories.
      4. Include direct links to the Apply Portals.
      
      Use Google Search Grounding to find 2024-25 active schemes.
      Return results as a JSON array of objects with keys: title, description, benefit, matchingCriteria, portal, authority.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                benefit: { type: Type.STRING },
                matchingCriteria: { type: Type.STRING },
                portal: { type: Type.STRING },
                authority: { type: Type.STRING }
              },
              required: ["title", "description", "benefit", "matchingCriteria", "portal", "authority"]
            }
          }
        }
      });

      if (response.text) {
        const results = JSON.parse(response.text);
        setAiResults(results);
      }
    } catch (err) {
      console.error("AI Search Error:", err);
      alert("AI Search failed. Please check your connection.");
    } finally {
      setIsSearchingAI(false);
    }
  };

  const filtered = Array.isArray(subsidies) ? subsidies.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Government Schemes & Subsidies
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Strategic financial support for Indian student entrepreneurs.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search schemes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <button 
            onClick={searchAISubsidies}
            disabled={isSearchingAI}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSearchingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            AI Search
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                 <span className="text-[10px] font-black uppercase tracking-[3px] text-emerald-400">Policy Focus</span>
               </div>
               <h2 className="text-2xl font-bold mb-4 tracking-tight">Startup India Initiative</h2>
               <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">Access tax holidays, faster patent examination, and relaxed norms for public procurement through the dedicated DIPP portal.</p>
               <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white text-slate-900 px-5 py-3 rounded-xl shadow-lg hover:bg-emerald-50 transition-all active:scale-95">
                 Explore Portal <ChevronRight size={14} />
               </button>
             </div>
             <Globe className="absolute -bottom-16 -right-16 text-white/5 w-64 h-64 group-hover:rotate-45 transition-transform duration-1000" />
           </div>

           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 tracking-tight">
               <ShieldCheck className="text-emerald-500" /> Eligibility Checklist
             </h3>
             <div className="space-y-4">
               {[
                 { title: "Digital ID", desc: "Aadhar linked to active mobile" },
                 { title: "Direct Benefit", desc: "DBT enabled bank account" },
                 { title: "Current Income", desc: "Digital Income Certificate" },
                 { title: "Residency", desc: "State Domicile Certificate" }
               ].map((item, i) => (
                 <div key={i} className="flex items-start gap-3">
                   <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                   </div>
                   <div>
                     <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{item.title}</p>
                     <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence>
            {aiResults.map((s, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                key={`ai-${i}`}
                className="bg-indigo-50/50 p-7 rounded-[2rem] border border-indigo-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white text-indigo-600 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 tracking-tight text-lg flex items-center gap-2">
                          {s.title}
                          <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">AI Match</span>
                        </h3>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">{s.authority}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium mb-3">{s.description}</p>
                    <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/50">
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[1px] mb-1">Tailored Recommendation</p>
                      <p className="text-[11px] text-slate-700 font-bold ">{s.matchingCriteria}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between items-end min-w-[160px]">
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[1.5px] shadow-lg shadow-indigo-200">
                      {s.benefit}
                    </div>
                    <a 
                      href={s.portal} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest mt-4 group/link"
                    >
                      Application Portal <LinkIcon size={14} className="group-hover/link:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading ? (
             [1,2,3,4].map(i => <div key={i} className="h-44 bg-white animate-pulse rounded-3xl border border-slate-100" />)
          ) : (
            filtered.map((s, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={s.id}
                className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight text-lg">{s.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-black uppercase px-2 py-0.5 rounded tracking-widest">{s.category}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Govt. Certified</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium pl-1">{s.description}</p>
                  </div>
                  
                  <div className="flex flex-col justify-between items-end min-w-[160px]">
                    <div className="flex items-center gap-2 text-[11px] font-black text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl group-hover:bg-emerald-100 transition-colors uppercase tracking-[1.5px] border border-emerald-100 shadow-sm shadow-emerald-500/5">
                      <Zap size={12} className="fill-emerald-500" /> {s.benefit}
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest mt-4">
                      Scheme Details <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
                {/* Subtle hover pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))
          )}

          {!loading && filtered.length === 0 && aiResults.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <Compass className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-slate-900 font-bold tracking-tight">No Subsidies Found</h3>
              <p className="text-slate-500 text-sm mt-1">Try the AI Search for real-time grant discovery.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
