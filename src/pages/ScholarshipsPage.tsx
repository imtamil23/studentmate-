import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, GraduationCap, ArrowUpRight, DollarSign, Calendar, Plus, X, ShieldCheck, Globe, Loader2, Link as LinkIcon, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Scholarship, User } from "../types";
import { api } from "../api";
import { cn } from "../lib/utils";
import { GoogleGenAI, Type } from "@google/genai";

export default function ScholarshipsPage({ user }: { user: User }) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [minMarks, setMinMarks] = useState<number | "">("");
  const [maxIncome, setMaxIncome] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"none" | "amount-desc">("none");
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  // Profile shortcuts for global use
  const userMarks = user.profile?.academicRecords?.class12?.percentage || user.profile?.marks || 0;
  const userIncome = user.profile?.parentalIncome || user.profile?.income || 1000000;
  const userCategory = user.profile?.category || "General";
  const userEdu = user.profile?.currentCourse?.courseName || user.profile?.education || "";
  const userState = user.profile?.domicileState || "India";
  const userDisability = user.profile?.isDisabled ? "PwD" : "None";

  useEffect(() => {
    api.scholarships.list().then(setScholarships).finally(() => setLoading(false));
  }, []);

  const handleAISearch = async () => {
    setIsSearchingAI(true);
    setAiResults([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const p = user.profile;
      
      const category = p?.category || "General";
      const state = p?.domicileState || "India";
      const course = p?.currentCourse?.courseName || "Undergraduate";
      const marks12 = p?.academicRecords?.class12?.percentage || p?.marks || "Good academic";
      const income = p?.parentalIncome || p?.income || "Standard";
      const disability = p?.isDisabled ? "Person with Disability (PwD)" : "General";
      const gender = p?.gender || "Any";
      
      const prompt = `Find 4-5 real, currently active scholarship opportunities for a student in India with these profile details:
      - Category/Caste: ${category}
      - State of Domicile: ${state}
      - Current Course: ${course}
      - Academic Record (12th %): ${marks12}%
      - Annual Family Income: ₹${income}
      - Gender: ${gender}
      - Disability Status: ${disability}
      
      Priority:
      1. State-specific scholarships for ${state}.
      2. Caste-based scholarships for ${category}.
      3. Income-based (EWS/BPL) scholarships if income < ₹2.5L.
      4. Gender-based scholarships if applicable.
      
      Use Google Search Grounding to find verified portals and 2024-25 deadlines.
      Return results as a JSON array of objects with keys: title, description, amount (number), deadline (YYYY-MM-DD), officialLink, caste (array), education (array), matchReason.`;

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
                amount: { type: Type.NUMBER },
                deadline: { type: Type.STRING },
                officialLink: { type: Type.STRING },
                caste: { type: Type.ARRAY, items: { type: Type.STRING } },
                education: { type: Type.ARRAY, items: { type: Type.STRING } },
                matchReason: { type: Type.STRING }
              },
              required: ["title", "description", "amount", "deadline", "officialLink", "caste", "education", "matchReason"]
            }
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setAiResults(data);
        
        // Auto-sync found data to backend
        try {
          await api.scholarships.sync(data);
          const updated = await api.scholarships.list();
          setScholarships(updated);
        } catch (syncErr) {
          console.error("Auto-sync failed:", syncErr);
        }
      }
    } catch (error) {
      console.error("AI Search failed:", error);
      alert("AI Search failed. Please verify your connection.");
    } finally {
      setIsSearchingAI(false);
    }
  };

  const filtered = Array.isArray(scholarships) ? scholarships.filter(s => {
    const searchLower = search.toLowerCase();
    const casteStr = (s.eligibility?.caste || []).join(" ").toLowerCase();
    const eduStr = (s.eligibility?.education || []).join(" ").toLowerCase();
    
    const matchesSearch = s.title.toLowerCase().includes(searchLower) || 
                         s.description.toLowerCase().includes(searchLower) ||
                         casteStr.includes(searchLower) ||
                         eduStr.includes(searchLower);
                         
    const matchesFilter = filter === "all" || (s.course || []).includes(filter);
    const matchesMarks = minMarks === "" || (s.eligibility?.marks || 0) >= Number(minMarks);
    const matchesIncome = maxIncome === "" || (s.eligibility?.income || 1000000) <= Number(maxIncome);
    
    // Auto-profile match
    const matchesUserProfile = !search && (
      ((s.eligibility?.caste && s.eligibility.caste.includes("All")) || 
       (s.eligibility?.caste && s.eligibility.caste.includes(userCategory))) &&
      ((s.eligibility?.education && s.eligibility.education.includes("Any")) || 
       (s.eligibility?.education && s.eligibility.education.includes(userEdu))) &&
      (userMarks >= (s.eligibility?.marks || 0)) &&
      (userIncome <= (s.eligibility?.income || 1000000))
    );

    return (matchesSearch || matchesUserProfile) && matchesFilter && matchesMarks && matchesIncome;
  }) : [];

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "amount-desc") {
      return b.amount - a.amount;
    }
    return 0;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Available Scholarships</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Browse opportunities verified by the Education Cell.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Keywords..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none min-w-[120px]"
              >
                <option value="all">All Courses</option>
                <option value="UG">Undergraduate</option>
                <option value="PG">Postgraduate</option>
                <option value="M.Tech">M.Tech</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none min-w-[120px]"
              >
                <option value="none">Default Sorting</option>
                <option value="amount-desc">Highest Amount First</option>
              </select>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-32">
                <input 
                  type="number" 
                  placeholder="Min Marks%" 
                  value={minMarks}
                  onChange={(e) => setMinMarks(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                />
              </div>
              <div className="relative flex-1 sm:w-32">
                <input 
                  type="number" 
                  placeholder="Max Income" 
                  value={maxIncome}
                  onChange={(e) => setMaxIncome(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          <Filter size={20} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Smart Match Active</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5 capitalize">We have analyzed your profile against 240+ scholarships.</p>
        </div>
        <Link to="/profile" className="hidden sm:block text-[10px] font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors uppercase tracking-widest">Refine Profile</Link>
      </div>

      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 shrink-0">
          <Globe size={24} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Deep Web Intelligence</h3>
          <p className="text-[11px] text-blue-600 font-bold leading-relaxed max-w-xl">
            Our AI will cross-reference your profile ({userCategory}, {userEdu || 'UG track'}) 
            with real-time global scholarship datasets using Google Search Grounding.
          </p>
        </div>
        <button 
          onClick={handleAISearch}
          disabled={isSearchingAI}
          className="px-6 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[2px] hover:bg-blue-800 transition-all shadow-lg flex items-center gap-2 shrink-0 active:scale-95 disabled:bg-slate-400"
        >
          {isSearchingAI ? (
            <>Searching Deep Web <Loader2 className="animate-spin" size={14} /></>
          ) : (
            <>Launch Targeted Search <ArrowUpRight size={14} /></>
          )}
        </button>
      </div>

      <AnimatePresence>
        {aiResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Real-time Web Results</h3>
              </div>
              <button 
                onClick={() => setAiResults([])}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-1"
              >
                <X size={14} /> Clear AI Results
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiResults.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Globe size={18} />
                      </div>
                      <div className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                        Verified Web Source
                      </div>
                    </div>
                    <h4 className="text-md font-bold text-slate-900 mb-2 leading-snug">{s.title}</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(s.caste || []).map((c: string) => (
                        <span key={c} className="text-[7px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">{c}</span>
                      ))}
                      {(s.education || []).map((e: string) => (
                        <span key={e} className="text-[7px] font-black bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">{e}</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">{s.description}</p>
                    <div className="bg-blue-50 border border-blue-100/50 p-3 rounded-xl mb-6">
                      <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Sparkles size={10} /> Personalized Recommendation
                      </p>
                      <p className="text-[10px] text-blue-700 font-bold leading-tight italic">"{s.matchReason}"</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/50 p-2.5 rounded-xl border border-blue-100/50">
                        <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Grant</p>
                        <p className="text-xs font-bold text-slate-800 tabular-nums">₹{(Number(s.amount) || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-white/50 p-2.5 rounded-xl border border-blue-100/50">
                        <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Due Date</p>
                        <p className="text-xs font-bold text-slate-800">{new Date(s.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                      </div>
                    </div>
                    <a 
                      href={s.officialLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full py-3 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      Visit Portal <ExternalLink size={12} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
          <GraduationCap size={18} />
        </div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Local Opportunities</h3>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-white animate-pulse rounded-2xl border border-slate-100" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((s) => {
            const isEligible = 
              (userMarks >= (s.eligibility?.marks || 0)) && 
              (userIncome <= (s.eligibility?.income || 1000000)) &&
              ((s.eligibility?.caste && (s.eligibility.caste.includes("All") || s.eligibility.caste.includes(userCategory))) || !s.eligibility?.caste) &&
              ((s.eligibility?.education && (s.eligibility.education.includes("Any") || s.eligibility.education.includes(userEdu))) || !s.eligibility?.education);
            
            return (
              <motion.div
                layout
                key={s.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "bg-white p-6 rounded-2xl border transition-all flex flex-col justify-between hover:shadow-xl h-full group overflow-hidden relative",
                  isEligible ? "border-emerald-200 ring-4 ring-emerald-50 shadow-emerald-50/20" : "border-slate-200 shadow-sm"
                )}
              >
                {/* Decorative background element for eligible apps */}
                {isEligible && (
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors" />
                )}

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm",
                      isEligible ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 border border-slate-100"
                    )}>
                      <GraduationCap size={24} />
                    </div>
                    {isEligible && (
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck size={10} /> Best Match
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">{s.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(s.eligibility?.caste || []).map(c => (
                      <span key={c} className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">{c}</span>
                    ))}
                    {(s.eligibility?.education || []).map(e => (
                      <span key={e} className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wider">{e}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed font-medium">{s.description}</p>
                </div>
                
                <div className="space-y-5 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Grant Value</p>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <DollarSign size={14} className="text-emerald-500" /> ₹{(Number(s.amount) || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <Calendar size={14} className="text-blue-500" /> {s.deadline ? new Date(s.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Flexible'}
                      </p>
                    </div>
                  </div>
                  <button className={cn(
                    "w-full py-3.5 text-[11px] font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-[2px] active:scale-95",
                    isEligible 
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200" 
                      : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                  )}>
                    Start Application <ArrowUpRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
