import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Briefcase, 
  Lightbulb, 
  User as UserIcon, 
  LogOut, 
  Building2,
  Menu,
  X
} from "lucide-react";
import { cn } from "./lib/utils";
import { User } from "./types";
import { api } from "./api";
import { getSupabase } from "./lib/supabase";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import CareerPage from "./pages/CareerPage";
import EDCHubPage from "./pages/EDCHubPage";
import ProfilePage from "./pages/ProfilePage";
import SubsidiesPage from "./pages/SubsidiesPage";

// Components
import NotificationCenter from "./components/NotificationCenter";

function Sidebar({ user, onLogout, isOpen, onClose }: { user: User | null, onLogout: () => void, isOpen: boolean, onClose: () => void }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Scholarships", path: "/scholarships", icon: GraduationCap },
    { name: "Subsidies", path: "/subsidies", icon: Building2 },
    { name: "Career Guide", path: "/career", icon: Briefcase },
    { name: "EDC Projects", path: "/projects", icon: Lightbulb },
    { name: "My Profile", path: "/profile", icon: UserIcon },
  ];

  if (!user) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col h-screen transform transition-transform duration-300 shrink-0 shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">E</div>
            <h1 className="text-lg font-bold text-white tracking-tight">EduGrowth</h1>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
              location.pathname === item.path 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {item.name === "My Profile" && user.profile?.avatarUrl ? (
              <img 
                src={user.profile.avatarUrl} 
                alt="Profile" 
                className="w-5 h-5 rounded-md object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <item.icon className={cn("w-5 h-5 transition-opacity", location.pathname === item.path ? "opacity-100 text-emerald-400" : "opacity-70 group-hover:opacity-100 text-slate-400")} />
            )}
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 mb-4 bg-slate-800/50 mx-4 rounded-2xl border border-slate-700/50">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Profile Status</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-400">Elite Tier</span>
          <span className="text-[10px] text-slate-400">{Math.min(100, Math.round(user.points / 10))}%</span>
        </div>
        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, user.points / 10)}%` }}
            className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
          />
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-5 h-5 opacity-70" />
          Sign Out
        </button>
      </div>
    </aside>
    </>
  );
}

function Header({ user, onMenuClick }: { user: User | null, onMenuClick: () => void }) {
  const location = useLocation();
  if (!user) return null;

  const getTitle = () => {
    switch (location.pathname) {
      case "/dashboard": return "Dashboard Overview";
      case "/scholarships": return "Scholarship Finder";
      case "/subsidies": return "Government Schemes";
      case "/career": return "Career Roadmap";
      case "/projects": return "EDC Innovation Hub";
      case "/profile": return "Account Settings";
      default: return "EduGrowth Hub";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800">{getTitle()}</h2>
      </div>
      <div className="flex items-center gap-6">
        <NotificationCenter />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
          <span className="text-sm">⭐</span>
          <span className="text-sm font-bold text-yellow-700">{(user.points || 0).toLocaleString()} pts</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user.name}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-tighter font-medium">{user.profile?.education || "Student"}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-xl border-2 border-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden">
             {user.profile?.avatarUrl ? (
               <img 
                 src={user.profile.avatarUrl} 
                 alt={user.name} 
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
               />
             ) : (
               <UserIcon size={20} />
             )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    
    const initializeAuth = async () => {
      // 1. Initial health check
      api.fetch("/health").then(data => {
        console.log("Backend Health:", data);
      }).catch(err => console.error("Backend unreachable during startup:", err));

      if (supabase) {
        // Set up real-time session listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log(`[Auth] Event: ${event}`);
          if (session) {
            localStorage.setItem("token", session.access_token);
            try {
              const profile = await api.profile.get();
              setUser(profile);
            } catch (e) {
              console.warn("Failed to get profile for supabase session:", e);
              if (session.user) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || "",
                  name: session.user.user_metadata?.name || "User",
                  points: 0,
                  badges: [],
                  documents: [],
                  profile: session.user.user_metadata?.profile || {}
                });
              }
            }
            setLoading(false);
          } else {
            // Only clear if we don't have a local token, otherwise it might be a custom backend session
            const localToken = localStorage.getItem("token");
            if (!localToken || event === 'SIGNED_OUT') {
              localStorage.removeItem("token");
              setUser(null);
              setLoading(false);
            } else if (localToken) {
              // Try to validate the local token
              try {
                const profile = await api.profile.get();
                setUser(profile);
              } catch (e) {
                localStorage.removeItem("token");
                setUser(null);
              }
              setLoading(false);
            }
          }
        });

        return () => subscription.unsubscribe();
      } else {
        // Fallback for non-supabase environments
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const profile = await api.profile.get();
            setUser(profile);
          } catch (e) {
            localStorage.removeItem("token");
            setUser(null);
          }
        }
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = async () => {
    await api.auth.logout();
    setSidebarOpen(false);
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-blue-600">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <GraduationCap size={48} />
      </motion.div>
    </div>
  );

  return (
    <Router>
      <div className={cn("min-h-screen", user ? "flex bg-gray-50 text-slate-900 font-sans" : "bg-white")}>
        {user && (
          <Sidebar 
            user={user} 
            onLogout={handleLogout} 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
        
        <div className="flex-1 flex flex-col min-w-0">
          {user && <Header user={user} onMenuClick={() => setSidebarOpen(true)} />}
          <main className={cn(user ? "p-4 lg:p-8" : "")}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={setUser} />} />
                <Route path="/dashboard" element={user ? <DashboardPage user={user} /> : <Navigate to="/auth" />} />
                <Route path="/scholarships" element={user ? <ScholarshipsPage user={user} /> : <Navigate to="/auth" />} />
                <Route path="/subsidies" element={user ? <SubsidiesPage user={user} /> : <Navigate to="/auth" />} />
                <Route path="/career" element={user ? <CareerPage user={user} /> : <Navigate to="/auth" />} />
                <Route path="/projects" element={user ? <EDCHubPage user={user} /> : <Navigate to="/auth" />} />
                <Route path="/profile" element={user ? <ProfilePage user={user} onUpdate={setUser} /> : <Navigate to="/auth" />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </Router>
  );
}
