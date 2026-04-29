import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon, Save, Upload, FileText, BadgeCheck, ShieldCheck, Trophy, Sparkles, Plus, Zap, GraduationCap, Wallet, MapPin, Phone, Mail, Calendar, Info, Download } from "lucide-react";
import { User, UserProfile } from "../types";
import { api } from "../api";
import { cn } from "../lib/utils";

export default function ProfilePage({ user, onUpdate }: { user: User, onUpdate: (user: User) => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'financial'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  
  const normalizeUser = (u: User): User => ({
    ...u,
    profile: {
      fullName: u.profile?.fullName || u.name || "",
      dob: u.profile?.dob || "",
      gender: u.profile?.gender || "Male",
      maritalStatus: u.profile?.maritalStatus || "Single",
      mobile: u.profile?.mobile || "",
      email: u.profile?.email || u.email || "",
      currentAddress: u.profile?.currentAddress || "",
      permanentAddress: u.profile?.permanentAddress || "",
      domicileState: u.profile?.domicileState || "",
      category: u.profile?.category || "General",
      academicRecords: {
        class10: u.profile?.academicRecords?.class10 || { rollNo: "", marks: 0, percentage: 0, year: "" },
        class12: u.profile?.academicRecords?.class12 || { rollNo: "", marks: 0, percentage: 0, year: "" },
      },
      currentCourse: u.profile?.currentCourse || {
        institution: u.profile?.education || "", 
        courseName: "",
        mode: "Regular",
        currentYear: "",
        semester: "",
        admissionNo: "",
      },
      competitiveExams: u.profile?.competitiveExams || [],
      parentalIncome: u.profile?.parentalIncome || u.profile?.income || 0,
      parentalProfession: u.profile?.parentalProfession || "",
      livingStatus: u.profile?.livingStatus || "Day Scholar",
      isDisabled: u.profile?.isDisabled || false,
      disabilityDetails: u.profile?.disabilityDetails || "",
      avatarUrl: u.profile?.avatarUrl || "",
      skills: u.profile?.skills || [],
      interests: u.profile?.interests || [],
    }
  });

  const [formData, setFormData] = useState<User>(normalizeUser(user));
  
  useEffect(() => {
    setFormData(normalizeUser(user));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await api.profile.update(formData);
      onUpdate(updatedUser);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(normalizeUser(user));
    setIsEditing(false);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setFormData(prev => {
      const nextProfile = { ...prev.profile, ...updates };
      return {
        ...prev,
        name: updates.fullName || prev.name,
        profile: nextProfile
      };
    });
  };

  const tabs = [
    { id: 'personal', label: 'Identity & Contact', icon: UserIcon },
    { id: 'academic', label: 'Academic Records', icon: GraduationCap },
    { id: 'financial', label: 'Financial & Socio', icon: Wallet },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Left: Detailed Profile Forms */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-20 h-20 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 overflow-hidden flex items-center justify-center border-4 border-white">
                    {formData.profile.avatarUrl ? (
                      <img 
                        src={formData.profile.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon size={32} />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-lg shadow-lg cursor-pointer hover:bg-emerald-600 transition-all active:scale-95 border-2 border-white">
                      <Upload size={14} />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setLoading(true);
                          try {
                            // We use the same document upload API but it returns a URL we can use for avatar
                            const newDoc = await api.documents.upload(file, "Profile Picture", "Other");
                            const nextProfile = { ...formData.profile, avatarUrl: newDoc.url };
                            const nextUser = { ...formData, profile: nextProfile };
                            
                            // Immediately sync to cloud as requested
                            const updatedUser = await api.profile.update(nextUser);
                            setFormData(normalizeUser(updatedUser));
                            onUpdate(updatedUser);
                            setSuccess(true);
                            setTimeout(() => setSuccess(false), 3000);
                          } catch (err: any) {
                            alert(err.message || "Failed to upload image");
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{formData.profile.fullName || "User Profile"}</h1>
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-1 inline-flex items-center gap-2">
                    <Sparkles size={12} className="text-amber-500" /> Professional ID: {user.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleCancel}
                      className="px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[2px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={loading}
                      className={cn(
                        "px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[2px] transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl active:scale-95",
                        success ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                      )}
                    >
                      {success ? "Saved Successfully" : "Save Changes"}
                      {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles size={16} /></motion.div> : <Save size={16} />}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[2px] bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm active:scale-95"
                  >
                    Edit Profile
                    <Sparkles size={16} className="text-amber-500" />
                  </button>
                )}
              </div>
            </div>

            {/* TAB Navigation */}
            <div className="px-8 pt-6 flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs whitespace-nowrap transition-all border",
                    activeTab === tab.id 
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                      : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                  )}
                >
                  {tab.id === 'personal' && formData.profile.avatarUrl ? (
                    <img 
                      src={formData.profile.avatarUrl} 
                      alt="" 
                      className="w-4 h-4 rounded-md object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <tab.icon size={16} />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8 lg:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'personal' && (
                    <div className="space-y-10">
                      <section className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name (As per Certificates)</label>
                          <input 
                            value={formData.profile.fullName}
                            onChange={(e) => updateProfile({ fullName: e.target.value })}
                            readOnly={!isEditing}
                            className={cn(
                              "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800",
                              !isEditing && "cursor-default opacity-80"
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                          <div className="relative">
                            <input 
                              type="date"
                              value={formData.profile.dob}
                              onChange={(e) => updateProfile({ dob: e.target.value })}
                              readOnly={!isEditing}
                              className={cn(
                                "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800",
                                !isEditing && "cursor-default opacity-80"
                              )}
                            />
                            <Calendar size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-slate-400">Gender</label>
                          <div className="flex gap-2">
                            {['Male', 'Female', 'Other'].map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => isEditing && updateProfile({ gender: g as any })}
                                className={cn(
                                  "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all border",
                                  formData.profile.gender === g ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-500 border-slate-100",
                                  !isEditing && "cursor-default opacity-60"
                                )}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Marital Status</label>
                          <select 
                            value={formData.profile.maritalStatus}
                            onChange={(e) => updateProfile({ maritalStatus: e.target.value as any })}
                            disabled={!isEditing}
                            className={cn(
                              "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800 appearance-none",
                              !isEditing && "cursor-default opacity-80"
                            )}
                          >
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                      </section>

                       <section className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <Phone size={12} /> Mobile Number
                          </label>
                           <div className="relative group">
                            <input 
                              value={formData.profile.mobile}
                              onChange={(e) => updateProfile({ mobile: e.target.value })}
                              placeholder="+91 XXXXX XXXXX"
                              readOnly={!isEditing}
                              className={cn(
                                "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800",
                                !isEditing && "cursor-default opacity-80"
                              )}
                            />
                          </div>
                        </div>
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Mail size={12} /> Professional Email
                          </label>
                          <input 
                            value={formData.profile.email}
                            onChange={(e) => updateProfile({ email: e.target.value })}
                            readOnly={!isEditing}
                            className={cn(
                              "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800",
                              !isEditing && "cursor-default opacity-80"
                            )}
                          />
                        </div>
                      </section>

                      <section className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <MapPin size={12} /> Current Residential Address
                          </label>
                           <textarea 
                            value={formData.profile.currentAddress}
                            onChange={(e) => updateProfile({ currentAddress: e.target.value })}
                            rows={2}
                            readOnly={!isEditing}
                            className={cn(
                              "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800 resize-none",
                              !isEditing && "cursor-default opacity-80"
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <MapPin size={12} /> Permanent Address
                          </label>
                          <textarea 
                            value={formData.profile.permanentAddress}
                            onChange={(e) => updateProfile({ permanentAddress: e.target.value })}
                            rows={2}
                            readOnly={!isEditing}
                            className={cn(
                              "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800 resize-none",
                              !isEditing && "cursor-default opacity-80"
                            )}
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Domicile State</label>
                            <input 
                              value={formData.profile.domicileState}
                              onChange={(e) => updateProfile({ domicileState: e.target.value })}
                              placeholder="e.g. Tamil Nadu"
                              readOnly={!isEditing}
                              className={cn(
                                "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800",
                                !isEditing && "cursor-default opacity-80"
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category / Caste</label>
                            <select 
                              value={formData.profile.category}
                              onChange={(e) => updateProfile({ category: e.target.value as any })}
                              disabled={!isEditing}
                              className={cn(
                                "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800 appearance-none",
                                !isEditing && "cursor-default opacity-80"
                              )}
                            >
                              <option value="General">General</option>
                              <option value="OBC">OBC</option>
                              <option value="SC">SC</option>
                              <option value="ST">ST</option>
                              <option value="EWS">EWS</option>
                            </select>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {activeTab === 'academic' && (
                    <div className="space-y-12">
                      {/* Previous Academic Records */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-1 bg-slate-900 rounded-full" />
                          <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">Previous Academic History</h3>
                        </div>
                        
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-8">
                          {/* Class 12 */}
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Class 12 / Higher Secondary</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                                <input 
                                  value={formData.profile.academicRecords.class12.rollNo}
                                  onChange={(e) => isEditing && updateProfile({ 
                                    academicRecords: { ...formData.profile.academicRecords, class12: { ...formData.profile.academicRecords.class12, rollNo: e.target.value } }
                                  })}
                                  readOnly={!isEditing}
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500/10 outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marks Obtained</label>
                                <input 
                                  type="number"
                                  value={isNaN(formData.profile.academicRecords.class12.marks) ? "" : formData.profile.academicRecords.class12.marks}
                                  readOnly={!isEditing}
                                  onChange={(e) => {
                                    if (!isEditing) return;
                                    const val = parseInt(e.target.value);
                                    updateProfile({ 
                                      academicRecords: { ...formData.profile.academicRecords, class12: { ...formData.profile.academicRecords.class12, marks: isNaN(val) ? 0 : val } }
                                    })
                                  }}
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500/10 outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Percentage (%)</label>
                                <input 
                                  type="number"
                                  step="0.01"
                                  value={isNaN(formData.profile.academicRecords.class12.percentage) ? "" : formData.profile.academicRecords.class12.percentage}
                                  readOnly={!isEditing}
                                  onChange={(e) => {
                                    if (!isEditing) return;
                                    const val = parseFloat(e.target.value);
                                    updateProfile({ 
                                      academicRecords: { ...formData.profile.academicRecords, class12: { ...formData.profile.academicRecords.class12, percentage: isNaN(val) ? 0 : val } }
                                    })
                                  }}
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500/10 outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Passing Year</label>
                                <input 
                                  value={formData.profile.academicRecords.class12.year}
                                  readOnly={!isEditing}
                                  onChange={(e) => isEditing && updateProfile({ 
                                    academicRecords: { ...formData.profile.academicRecords, class12: { ...formData.profile.academicRecords.class12, year: e.target.value } }
                                  })}
                                  placeholder="2022"
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500/10 outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Class 10 */}
                          <div className="space-y-4 pt-4 border-t border-slate-200/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Class 10 / Matriculation</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                                 <input 
                                  value={formData.profile.academicRecords.class10.rollNo}
                                  readOnly={!isEditing}
                                  onChange={(e) => isEditing && updateProfile({ 
                                    academicRecords: { ...formData.profile.academicRecords, class10: { ...formData.profile.academicRecords.class10, rollNo: e.target.value } }
                                  })}
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500/10 outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Percentage (%)</label>
                                <input 
                                  type="number"
                                  step="0.01"
                                  value={isNaN(formData.profile.academicRecords.class10.percentage) ? "" : formData.profile.academicRecords.class10.percentage}
                                  readOnly={!isEditing}
                                  onChange={(e) => {
                                    if (!isEditing) return;
                                    const val = parseFloat(e.target.value);
                                    updateProfile({ 
                                      academicRecords: { ...formData.profile.academicRecords, class10: { ...formData.profile.academicRecords.class10, percentage: isNaN(val) ? 0 : val } }
                                    })
                                  }}
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500/10 outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Passing Year</label>
                                <input 
                                  value={formData.profile.academicRecords.class10.year}
                                  readOnly={!isEditing}
                                  onChange={(e) => isEditing && updateProfile({ 
                                    academicRecords: { ...formData.profile.academicRecords, class10: { ...formData.profile.academicRecords.class10, year: e.target.value } }
                                  })}
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500/10 outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Current Course Details */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-1 bg-blue-600 rounded-full" />
                          <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">Active Enrollment Details</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Institution Name</label>
                            <input 
                              value={formData.profile.currentCourse.institution}
                              readOnly={!isEditing}
                              onChange={(e) => isEditing && updateProfile({ currentCourse: { ...formData.profile.currentCourse, institution: e.target.value } })}
                              className={cn(
                                "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800",
                                !isEditing && "cursor-default opacity-80"
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course Name</label>
                            <input 
                              value={formData.profile.currentCourse.courseName}
                              readOnly={!isEditing}
                              onChange={(e) => isEditing && updateProfile({ currentCourse: { ...formData.profile.currentCourse, courseName: e.target.value } })}
                              className={cn(
                                "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all font-bold text-slate-800",
                                !isEditing && "cursor-default opacity-80"
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mode of Study</label>
                            <div className="flex gap-2">
                              {['Regular', 'Distance'].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => isEditing && updateProfile({ currentCourse: { ...formData.profile.currentCourse, mode: m as any } })}
                                  className={cn(
                                    "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all border",
                                    formData.profile.currentCourse.mode === m ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-500 border-slate-100",
                                    !isEditing && "cursor-default opacity-60"
                                  )}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Year</label>
                              <input 
                                value={formData.profile.currentCourse.currentYear}
                                readOnly={!isEditing}
                                onChange={(e) => isEditing && updateProfile({ currentCourse: { ...formData.profile.currentCourse, currentYear: e.target.value } })}
                                placeholder="3rd Year"
                                className={cn(
                                  "w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none transition-all",
                                  !isEditing && "cursor-default opacity-80"
                                )}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Semester</label>
                              <input 
                                value={formData.profile.currentCourse.semester}
                                readOnly={!isEditing}
                                onChange={(e) => isEditing && updateProfile({ currentCourse: { ...formData.profile.currentCourse, semester: e.target.value } })}
                                placeholder="6th Sem"
                                className={cn(
                                  "w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none transition-all",
                                  !isEditing && "cursor-default opacity-80"
                                )}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Institution Admission / Enrollment No.</label>
                            <input 
                              value={formData.profile.currentCourse.admissionNo}
                              readOnly={!isEditing}
                              onChange={(e) => isEditing && updateProfile({ currentCourse: { ...formData.profile.currentCourse, admissionNo: e.target.value } })}
                              className={cn(
                                "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all font-bold text-slate-800 outline-none",
                                !isEditing && "cursor-default opacity-80"
                              )}
                            />
                          </div>
                        </div>
                      </section>

                      {/* Competitive Exams */}
                      <section className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">Competitive Exam Qualifications</h3>
                          </div>
                           {isEditing && (
                            <button 
                              type="button"
                              onClick={() => updateProfile({ competitiveExams: [...formData.profile.competitiveExams, { name: "", score: "" }] })}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                            >
                              <Plus size={18} />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {formData.profile.competitiveExams.map((exam, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group/exam">
                              {isEditing && (
                                <button 
                                  onClick={() => {
                                    const next = [...formData.profile.competitiveExams];
                                    next.splice(index, 1);
                                    updateProfile({ competitiveExams: next });
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/exam:opacity-100 transition-opacity shadow-lg"
                                >
                                  <Plus size={12} className="rotate-45" />
                                </button>
                              )}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Exam Name (JEE, NEET, etc.)</label>
                                <input 
                                  value={exam.name}
                                  readOnly={!isEditing}
                                  onChange={(e) => {
                                    if (!isEditing) return;
                                    const next = [...formData.profile.competitiveExams];
                                    next[index].name = e.target.value;
                                    updateProfile({ competitiveExams: next });
                                  }}
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Score / Percentile</label>
                                <input 
                                  value={exam.score}
                                  readOnly={!isEditing}
                                  onChange={(e) => {
                                    if (!isEditing) return;
                                    const next = [...formData.profile.competitiveExams];
                                    next[index].score = e.target.value;
                                    updateProfile({ competitiveExams: next });
                                  }}
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rank (Optional)</label>
                                <input 
                                  value={exam.rank}
                                  readOnly={!isEditing}
                                  onChange={(e) => {
                                    if (!isEditing) return;
                                    const next = [...formData.profile.competitiveExams];
                                    next[index].rank = e.target.value;
                                    updateProfile({ competitiveExams: next });
                                  }}
                                  className={cn(
                                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700",
                                    !isEditing && "cursor-default opacity-80"
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {activeTab === 'financial' && (
                    <div className="space-y-10">
                      <section className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Annual Family Income (Total ₹)</label>
                          <div className="relative">
                            <input 
                              type="number"
                              value={isNaN(formData.profile.parentalIncome) ? "" : formData.profile.parentalIncome}
                              readOnly={!isEditing}
                              onChange={(e) => {
                                if (!isEditing) return;
                                const val = parseInt(e.target.value);
                                updateProfile({ parentalIncome: isNaN(val) ? 0 : val });
                              }}
                              className={cn(
                                "w-full px-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white transition-all font-bold text-slate-800 outline-none",
                                !isEditing && "cursor-default opacity-80"
                              )}
                            />
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">₹</span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold ml-1">Verified via Income Certificate</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Parental Profession</label>
                          <input 
                            value={formData.profile.parentalProfession}
                            readOnly={!isEditing}
                            onChange={(e) => isEditing && updateProfile({ parentalProfession: e.target.value })}
                            placeholder="e.g. Farmer, Government Employee"
                            className={cn(
                              "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all font-bold text-slate-800 outline-none",
                              !isEditing && "cursor-default opacity-80"
                            )}
                          />
                        </div>
                      </section>

                      <section className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Living Status</label>
                          <div className="flex gap-2">
                            {['Hosteller', 'Day Scholar'].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => isEditing && updateProfile({ livingStatus: s as any })}
                                className={cn(
                                  "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all border",
                                  formData.profile.livingStatus === s ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-500 border-slate-100",
                                  !isEditing && "cursor-default opacity-60"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Disability Status (PWD)</label>
                          <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                             <input 
                               type="checkbox"
                               checked={formData.profile.isDisabled}
                               disabled={!isEditing}
                               onChange={(e) => updateProfile({ isDisabled: e.target.checked })}
                               className="w-5 h-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 transition-all opacity-80"
                             />
                             <span className={cn("text-xs font-bold", !isEditing ? "text-slate-400" : "text-slate-700")}>I have a physical disability</span>
                          </div>
                        </div>
                      </section>

                      {formData.profile.isDisabled && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="space-y-2 bg-slate-50 p-6 rounded-3xl border border-slate-100"
                        >
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Disability Details & Proof Certificate No.</label>
                          <textarea 
                            value={formData.profile.disabilityDetails}
                            readOnly={!isEditing}
                            onChange={(e) => isEditing && updateProfile({ disabilityDetails: e.target.value })}
                            rows={3}
                            placeholder="Please specify nature of disability and certificate information"
                            className={cn(
                              "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 resize-none transition-all",
                              !isEditing && "cursor-default opacity-80"
                            )}
                          />
                        </motion.div>
                      )}

                      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-1">
                          <Info size={18} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Verification Notice</h4>
                          <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                            Financial details must strictly correspond with the Income Certificate uploaded in your Document Vault. Misreporting may lead to application rejection across all government schemes.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Documents & Achievements */}
        <div className="lg:col-span-4 space-y-6 mt-8 lg:mt-0">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Document Vault</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Secure Storage</span>
                </div>
              </div>

              <div className="space-y-4">
                {user.documents && user.documents.length > 0 ? (
                  user.documents.map((doc) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={doc.id} 
                      className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col gap-4 group hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm",
                            doc.status === 'verified' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                            doc.status === 'rejected' ? "bg-red-50 border-red-100 text-red-600" : "bg-white border-slate-200 text-slate-400"
                          )}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{doc.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{doc.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.url && (
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              download={doc.name}
                              className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 rounded-lg transition-all flex items-center gap-1 group/dl"
                              title="Download document"
                            >
                              <Download size={14} className="group-hover/dl:scale-110 transition-transform" />
                            </a>
                          )}
                          <div className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest",
                            doc.status === 'verified' ? "bg-emerald-100 text-emerald-700" : 
                            doc.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          )}>
                            {doc.status}
                          </div>
                        </div>
                      </div>

                      {doc.status === 'pending' && (
                        <button 
                          onClick={async () => {
                            const updated = await api.documents.verify(doc.id);
                            const updatedUser = { ...user, documents: user.documents.map(d => d.id === doc.id ? updated : d) };
                            onUpdate(updatedUser);
                          }}
                          className="w-full py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[2px] rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                        >
                          Verify Authenticity <BadgeCheck size={14} />
                        </button>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                    <FileText className="mx-auto text-slate-200 mb-4" size={40} />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No Documents Uploaded</p>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[2px] mb-4 text-center">Add Mandatory Copies</p>
                  
                  <input 
                    type="file" 
                    id="doc-upload" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const type = (e.target as any).dataset.type || "Other";
                      setLoading(true);
                      try {
                        const newDoc = await api.documents.upload(file, file.name, type);
                        onUpdate({ ...user, documents: [...(user.documents || []), newDoc] });
                      } catch (err: any) {
                        alert(err.message || "Failed to upload document");
                      } finally {
                        setLoading(false);
                      }
                    }} 
                  />

                  {[
                    { type: 'Aadhaar' as const, label: 'Identity Node (Aadhaar)', icon: ShieldCheck, color: 'bg-emerald-500' },
                    { type: 'Marksheet' as const, label: 'Academic Transcript', icon: FileText, color: 'bg-slate-900' },
                    { type: 'Income Certificate' as const, label: 'Financial Proof', icon: Zap, color: 'bg-blue-600' }
                  ].map((shortcut) => (
                    <button 
                      key={shortcut.type}
                      onClick={() => {
                        const input = document.getElementById('doc-upload') as HTMLInputElement;
                        input.dataset.type = shortcut.type;
                        input.click();
                      }}
                      disabled={loading}
                      className={cn(
                        "w-full p-4 rounded-2xl flex items-center justify-between group/btn transition-all active:scale-[0.98] border border-white/10 shadow-lg text-white disabled:opacity-50",
                        shortcut.color
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <shortcut.icon size={18} className="opacity-80 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{shortcut.label}</span>
                      </div>
                      {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }}><Plus size={14} /></motion.div> : <Plus size={14} className="opacity-50 group-hover/btn:opacity-100 transition-opacity" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden group">
            <h3 className="text-lg font-bold mb-6 tracking-tight relative z-10">Honor Board</h3>
            <div className="grid grid-cols-3 gap-4 relative z-10">
               {(user.badges || []).length > 0 ? (user.badges || []).map((badge, i) => (
                 <div key={i} className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors shadow-inner">
                   <Trophy size={20} className="text-emerald-400" />
                 </div>
               )) : (
                 <p className="col-span-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-8">Begin your journey to earn badges</p>
               )}
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
