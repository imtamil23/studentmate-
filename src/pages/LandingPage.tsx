import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, Briefcase, Lightbulb, CheckCircle, ArrowRight, Zap, Target, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";

export default function LandingPage() {
  const features = [
    {
      icon: GraduationCap,
      title: "Scholarship Discovery",
      description: "Personalized alerts for scholarships and subsidies based on your profile and eligibility.",
      color: "emerald"
    },
    {
      icon: Briefcase,
      title: "Career Guidance",
      description: "AI-powered career roadmaps, skill analysis, and job market insights for your domain.",
      color: "slate"
    },
    {
      icon: Lightbulb,
      title: "EDC Project Hub",
      description: "Turn your innovative ideas into reality with our Entrepreneurship Development Cell.",
      color: "amber"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-40">
        <div className="absolute inset-0 bg-slate-50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-[2px] mb-8">
                 <Zap size={12} className="animate-pulse" /> Next-Gen Education Node
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
                Empower Your <span className="text-emerald-500 italic">Academic</span> Future.
              </h1>
              <p className="text-xl text-slate-500 mb-12 max-w-xl leading-relaxed font-medium">
                The strategic command center for students. Navigate scholarships, AI-forged career paths, and venture development via EDC.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/auth" className="px-10 py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[3px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95">
                  Initialize Access <ArrowRight size={18} className="text-emerald-400" />
                </Link>
                <a href="#features" className="px-10 py-5 bg-emerald-500 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[3px] hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center active:scale-95">
                  Review Benefits
                </a>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-5 mt-24 lg:mt-0 relative"
            >
              <div className="relative z-10 bg-white p-10 rounded-[3rem] shadow-[0_48px_80px_-16px_rgba(0,0,0,0.1)] border border-slate-100 group">
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-500 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                      <GraduationCap size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">Scholarship Match</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Founders Grant 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-500">₹85K</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Est. Value</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Eligibility Index</span>
                     <span className="text-xs font-black text-emerald-500">94%</span>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 p-4 bg-slate-900 text-white rounded-3xl shadow-2xl flex items-center gap-3">
                   <Target className="text-emerald-400" size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Goal Reached</span>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-emerald-400/5 blur-[120px] -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase leading-none">Engineering <span className="text-emerald-500">Excellence.</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-[4px] text-xs">Propelling global leaders through strategic modules.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group overflow-hidden relative"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-all group-hover:scale-110 group-hover:bg-opacity-100", 
                  feature.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
                  feature.color === "slate" ? "bg-slate-200 text-slate-900" : "bg-amber-50 text-amber-500"
                )}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-none uppercase italic">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-10 text-sm">{feature.description}</p>
                <Link to="/auth" className={cn("text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all",
                  feature.color === "emerald" ? "text-emerald-600" : 
                  feature.color === "slate" ? "text-slate-900" : "text-amber-600"
                )}>
                  Initialize Module <ArrowRight size={18} />
                </Link>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-0 group-hover:opacity-10 scale-150 transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
