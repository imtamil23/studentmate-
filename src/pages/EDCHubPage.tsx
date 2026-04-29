import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Plus, Brain, ArrowUpRight, Trophy, Users, Rocket, Sparkles, CheckCircle2, Zap, X } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { User, Project } from "../types";
import { api } from "../api";
import { cn } from "../lib/utils";

export default function EDCHubPage({ user }: { user: User }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({ title: "", description: "" });

  useEffect(() => {
    api.projects.list().then(data => setProjects(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
  }, []);

  const generateIdeas = async () => {
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 3 specific, innovative startup/project ideas for a student.
        Interests: ${user.profile?.interests?.join(", ") || "N/A"}
        Education: ${user.profile?.education || "N/A"}
        
        Provide only titles and 1-sentence descriptions in a list format.`,
      });
      const ideas = response.text?.split("\n").filter(l => l.trim().length > 10).slice(0, 3) || [];
      setAiSuggestions(ideas);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProject = await api.projects.create(formData);
      setProjects([newProject, ...projects]);
      setIsModalOpen(false);
      setFormData({ title: "", description: "" });
    } catch (e) {
      alert("Failed to submit project");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Incubator Hub (EDC)</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Transforming student innovations into market-ready ventures.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[2px] transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95"
        >
          <Plus size={18} /> Submit Innovation
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Project Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="text-emerald-500 w-5 h-5" />
            <h4 className="font-bold text-slate-800 tracking-tight">Community Feed</h4>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-44 bg-white animate-pulse rounded-[2rem] border border-slate-100" />)}
            </div>
          ) : (
            <div className="grid gap-6">
              {projects.length > 0 ? projects.map((p) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={p.id}
                  className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                >
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-colors shadow-sm">
                        {p.title[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{p.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={cn(
                             "text-[9px] font-black uppercase px-2.5 py-0.5 rounded tracking-widest",
                             p.status === 'prototype' ? "bg-blue-50 text-blue-600" : 
                             p.status === 'funding' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                           )}>
                             {p.status} phase
                           </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 font-medium relative z-10">{p.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-50 pt-6 relative z-10">
                    <div className="flex items-center gap-3">
                       <div className="flex -space-x-2">
                          {[1, 2].map(i => (
                            <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                <Users size={12} />
                            </div>
                          ))}
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1">3 Mentors Interested</span>
                    </div>
                    <button className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                      Discuss Project <ArrowUpRight size={14} className="text-emerald-500" />
                    </button>
                  </div>
                  
                  {/* Hover pattern */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mb-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              )) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <Rocket className="mx-auto text-slate-200 mb-4" size={64} />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Awaiting First Innovation Launch</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: AI Suggestions & Perks */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="text-emerald-400" size={20} />
                <h3 className="text-lg font-bold tracking-tight">AI Idea Lab</h3>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8">
                Stuck at the starting line? Our neural engine cross-references your interests with market gaps.
              </p>
              
              {aiSuggestions.length > 0 && (
                <div className="space-y-3 mb-8">
                  {aiSuggestions.map((idea, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-medium text-slate-300 italic flex gap-3 items-start"
                    >
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 shrink-0" />
                      {idea}
                    </motion.div>
                  ))}
                </div>
              )}

              <button 
                onClick={generateIdeas}
                disabled={aiLoading}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all flex items-center justify-center gap-2 hover:bg-emerald-50 active:scale-95 disabled:opacity-50"
              >
                {aiLoading ? "Processing Architecture..." : "Synthesize Concepts"}
                {aiLoading ? <Zap size={14} className="animate-pulse" /> : <Sparkles size={14} className="text-emerald-500" />}
              </button>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100/50">
                <Trophy size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Hub Advantages</h3>
              <ul className="space-y-4 pt-4">
                {[
                  "50 Pts reward per verified idea",
                  "Verified IP protection registration",
                  "Venture capital bridge network",
                  "Prototype development stipend"
                ].map((perk, i) => (
                  <li key={i} className="flex gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-normal">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />
          </div>
        </div>
      </div>

      {/* Innovation Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl p-0 rounded-[3rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.4)] overflow-hidden"
            >
              <div className="px-10 pt-10 pb-6 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Disclosure</h2>
                  <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Innovation Module V2.4</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Innovation Title</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. Cognitive Compute Node" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Disclosure & Logic</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Detail the technical implementation and problem set..." 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all resize-none font-medium text-slate-600 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 uppercase tracking-[3px] active:scale-[0.98]"
                  >
                    Transmit Innovation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
