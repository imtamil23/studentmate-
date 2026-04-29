import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Clock, Info, GraduationCap, Lightbulb, Building2, X } from "lucide-react";
import { Notification } from "../types";
import { api } from "../api";
import { cn } from "../lib/utils";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
      setError("Sync error");
      // Don't clear notifications on transient error
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Failed to mark all notifications as read:", e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'scholarship': return <GraduationCap className="text-emerald-500" size={16} />;
      case 'project': return <Lightbulb className="text-amber-500" size={16} />;
      case 'subsidy': return <Building2 className="text-blue-500" size={16} />;
      default: return <Info className="text-slate-400" size={16} />;
    }
  };

  const notificationsList = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors bg-white border border-slate-200 rounded-xl shadow-sm"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
            {unreadCount}
          </span>
        )}
        {error && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-rose-500 uppercase tracking-tighter whitespace-nowrap bg-white px-1">
            {error}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[40]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 z-[50] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white cursor-default">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[2px]">Notifications</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Strategic Updates Center</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/10"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto bg-white">
                {notificationsList.length > 0 ? (
                  notificationsList.map((n) => (
                    <div 
                      key={n.id}
                      className={cn(
                        "p-5 border-b border-slate-50 transition-colors relative group cursor-default",
                        !n.isRead ? "bg-emerald-50/30" : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{n.title}</h4>
                            <div className="flex items-center gap-2">
                              {!n.isRead && (
                                <button 
                                  onClick={() => markAsRead(n.id)}
                                  className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                              <span className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                                <Clock size={10} /> {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center italic">
                    <Bell className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No Intelligence Updates</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-[2px]">End of Stream</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
