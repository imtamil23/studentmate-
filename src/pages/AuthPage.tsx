import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Mail, Lock, User as UserIcon, Zap } from "lucide-react";
import { api } from "../api";
import { User } from "../types";

export default function AuthPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token, user } = isLogin 
        ? await api.auth.login({ email, password })
        : await api.auth.register({ email, password, name });
      
      localStorage.setItem("token", token);
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
              < GraduationCap className="text-emerald-400" size={28} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">{isLogin ? "Welcome Back" : "Initialize Account"}</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[2px] mt-3 italic">{isLogin ? "Authentication Required for Hub Access" : "Join the Strategic Education Node"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/50">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Official Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                />
              </div>
            )}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/50">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Email Registry"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
              />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/50">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Encryption Key"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
              />
            </div>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 uppercase tracking-widest leading-relaxed text-center">{error}</motion.p>}



            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-emerald-500 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[3px] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Register Node"}
              {!loading && <Zap size={18} />}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-100 pt-8">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">
              {isLogin ? "New to the hub?" : "Already verified?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-500 hover:text-emerald-600 transition-colors ml-1"
              >
                {isLogin ? "Initialize Account" : "Access Console"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
