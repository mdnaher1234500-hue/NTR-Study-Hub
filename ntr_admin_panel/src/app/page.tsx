"use client";

import React, { useState, useEffect, useRef } from "react";
import { DEGREES, getSubjectsForSemester, Degree, Subject } from "@/data/curriculumData";
import { db, auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { collection, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard,
  GraduationCap, 
  Settings, 
  UploadCloud, 
  Users, 
  BookOpen, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  Database,
  Search,
  Bell,
  Sun,
  Moon
} from "lucide-react";

// NEW: TiltCard Component
const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`,
      transition: "none",
      zIndex: 10
    });
  };
  
  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)",
      transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
      zIndex: 1
    });
  };

  return (
    <div
      className={`preserve-3d relative group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      <div className="hologram-reflection rounded-3xl"></div>
      <div className="transform-style h-full w-full relative z-10">{children}</div>
    </div>
  );
};

export default function AdminDashboard() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<"dashboard" | "curriculum" | "materials" | "members">("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [adminUser, setAdminUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Authenticate and fetch admin data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await new Promise(resolve => setTimeout(resolve, 800)); // wait for setDoc if newly created
        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
          setAdminUser(adminSnap.data());
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // State arrays for mock management
  const [selectedDegree, setSelectedDegree] = useState<Degree>(DEGREES[2]); // Default B.Sc
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [activeSubjects, setActiveSubjects] = useState<Subject[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Active subject selected for syllabus/notes update
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [syllabusText, setSyllabusText] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Subject adding form states
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");

  // Subject editing form states
  const [editSubName, setEditSubName] = useState("");
  const [editSubCode, setEditSubCode] = useState("");
  const [editSubDesc, setEditSubDesc] = useState("");

  // Admin Members State
  const [adminMembers, setAdminMembers] = useState<any[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    faculties: [] as string[]
  });
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [memberError, setMemberError] = useState("");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Sync admin members
  useEffect(() => {
    if (adminUser?.role === "super_admin") {
      const adminsRef = collection(db, "admins");
      const unsubscribe = onSnapshot(adminsRef, (snapshot) => {
        const admins: any[] = [];
        snapshot.forEach((doc) => {
          admins.push({ id: doc.id, ...doc.data() });
        });
        setAdminMembers(admins);
      });
      return () => unsubscribe();
    }
  }, [adminUser]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMember(true);
    setMemberError("");
    
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(memberForm)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add member");
      
      setIsAddingMember(false);
      setMemberForm({ name: "", email: "", password: "", role: "admin", faculties: [] });
      alert("Admin member added successfully!");
    } catch (err: any) {
      setMemberError(err.message);
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleToggleMemberActive = async (member: any) => {
    try {
      await updateDoc(doc(db, "admins", member.uid), {
        active: !member.active
      });
    } catch (err) {
      alert("Failed to update status. Are you a Super Admin?");
    }
  };

  const handleRemoveMember = async (uid: string) => {
    if (!confirm("Are you sure you want to remove this admin? This only removes Firestore access, Auth user must be deleted manually.")) return;
    try {
      await deleteDoc(doc(db, "admins", uid));
    } catch (err) {
      alert("Failed to delete admin.");
    }
  };

  // Sync subjects from Firestore
  useEffect(() => {
    setIsSyncing(true);
    const subjectsColRef = collection(db, "curriculum", selectedDegree.id, "semesters", selectedSemester.toString(), "subjects");
    const unsubscribe = onSnapshot(subjectsColRef, async (snapshot) => {
      const data: Subject[] = [];
      snapshot.forEach((doc) => {
        data.push(doc.data() as Subject);
      });
      
      let mergedList: Subject[] = [];
      if (data.length === 0) {
        // Auto-seed defaults in Firestore on first render
        const defaults = getSubjectsForSemester(selectedDegree.id, selectedSemester);
        for (const sub of defaults) {
          await setDoc(doc(db, "curriculum", selectedDegree.id, "semesters", selectedSemester.toString(), "subjects", sub.id), sub);
        }
        mergedList = defaults;
      } else {
        mergedList = data;
      }

      // Merge local proxy overrides if present
      try {
        const res = await fetch("http://localhost:3002/api/sync-curriculum");
        if (res.ok) {
          const syncData = await res.json();
          if (syncData.subjects && syncData.subjects.length > 0) {
            mergedList = mergedList.map(subj => {
              const override = syncData.subjects.find((s: any) => s.id === subj.id);
              return override ? override : subj;
            });
            // Also append any newly created custom subjects
            syncData.subjects.forEach((s: any) => {
              if (s.id.startsWith(`${selectedDegree.id}-sem${selectedSemester}`) && !mergedList.some(m => m.id === s.id)) {
                mergedList.push(s);
              }
            });
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve sync cache overrides: ", err);
      }

      setActiveSubjects(mergedList);
      setIsSyncing(false);
    }, async (error) => {
      console.warn("Firestore permissions blocked loading admin curriculum. Falling back to local state.", error);
      let mergedList = getSubjectsForSemester(selectedDegree.id, selectedSemester);

      // Merge local proxy overrides
      try {
        const res = await fetch("http://localhost:3002/api/sync-curriculum");
        if (res.ok) {
          const syncData = await res.json();
          if (syncData.subjects && syncData.subjects.length > 0) {
            mergedList = mergedList.map(subj => {
              const override = syncData.subjects.find((s: any) => s.id === subj.id);
              return override ? override : subj;
            });
            syncData.subjects.forEach((s: any) => {
              if (s.id.startsWith(`${selectedDegree.id}-sem${selectedSemester}`) && !mergedList.some(m => m.id === s.id)) {
                mergedList.push(s);
              }
            });
          }
        }
      } catch (err) {
        // Silent
      }

      setActiveSubjects(mergedList);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [selectedDegree, selectedSemester]);

  // Post local curriculum updates to Student Portal endpoint (CORS bypass for localhost same-machine showcase)
  const syncToStudentPortal = async (updatedList: Subject[]) => {
    try {
      await fetch("http://localhost:3002/api/sync-curriculum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ subjects: updatedList })
      });
      console.log("Locally synced curriculum update with student portal.");
    } catch (err) {
      console.warn("Failed to sync directly to student portal: ", err);
    }
  };

  // Add Subject handler
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    const newSubId = `${selectedDegree.id}-sem${selectedSemester}-${newSubCode.toLowerCase()}`;
    const newSubject: Subject = {
      id: newSubId,
      name: newSubName,
      code: newSubCode.toUpperCase(),
      description: newSubDesc || "Syllabus, lectures, slides, and study guides.",
      syllabus: "UNIT I: Introduction Details...\nUNIT II: Core Concepts...\nUNIT III: Applied Models...\nUNIT IV: Chapter Overviews...\nUNIT V: Summary Review."
    };

    const updatedList = [...activeSubjects, newSubject];
    try {
      await setDoc(doc(db, "curriculum", selectedDegree.id, "semesters", selectedSemester.toString(), "subjects", newSubId), newSubject);
    } catch (err) {
      console.warn("Curriculum write blocked by database rules. Adding to preview locally.", err);
      alert("Note: Database writes are locked. Added to local preview window.");
    }
    setActiveSubjects(updatedList);

    setNewSubName("");
    setNewSubCode("");
    setNewSubDesc("");
  };

  // Delete Subject handler
  const handleDeleteSubject = async (subjectId: string) => {
    const updatedList = activeSubjects.filter(s => s.id !== subjectId);
    try {
      await deleteDoc(doc(db, "curriculum", selectedDegree.id, "semesters", selectedSemester.toString(), "subjects", subjectId));
    } catch (err) {
      console.warn("Curriculum delete blocked by database rules. Removing locally.", err);
    }
    setActiveSubjects(updatedList);
    syncToStudentPortal(updatedList);
    
    if (activeSubject?.id === subjectId) {
      setActiveSubject(null);
    }
  };

  // Open active subject details for syllabus and note updates
  const handleManageSubject = (subj: Subject) => {
    setActiveSubject(subj);
    setSyllabusText(subj.syllabus);
    setEditSubName(subj.name);
    setEditSubCode(subj.code);
    setEditSubDesc(subj.description);
    setActiveTab("materials");
  };

  // Save Subject Settings (Name, Code, Description)
  const handleSaveSettings = async () => {
    if (!activeSubject) return;

    const updatedFields = {
      name: editSubName,
      code: editSubCode.toUpperCase(),
      description: editSubDesc
    };

    const updatedList = activeSubjects.map(s => s.id === activeSubject.id ? { ...s, ...updatedFields } : s);
    try {
      await updateDoc(doc(db, "curriculum", selectedDegree.id, "semesters", selectedSemester.toString(), "subjects", activeSubject.id), updatedFields);
      alert("Subject settings updated in database successfully!");
    } catch (err) {
      console.warn("Subject settings edit write blocked by database rules. Updating locally.", err);
      alert("Note: Database writes are locked. Updated subject settings in local preview.");
    }
    setActiveSubjects(updatedList);
    syncToStudentPortal(updatedList);

    setActiveSubject(prev => prev ? ({ ...prev, ...updatedFields }) : null);
  };

  // Save Syllabus
  const handleSaveSyllabus = async () => {
    if (!activeSubject) return;
    
    const updatedList = activeSubjects.map(s => s.id === activeSubject.id ? { ...s, syllabus: syllabusText } : s);
    try {
      await updateDoc(doc(db, "curriculum", selectedDegree.id, "semesters", selectedSemester.toString(), "subjects", activeSubject.id), {
        syllabus: syllabusText
      });
      alert("Syllabus updated in database successfully!");
    } catch (err) {
      console.warn("Syllabus edit write blocked by database rules. Updating locally.", err);
      alert("Note: Database writes are locked. Updated syllabus in local preview.");
    }
    setActiveSubjects(updatedList);
    syncToStudentPortal(updatedList);

    setActiveSubject(prev => prev ? ({ ...prev, syllabus: syllabusText }) : null);
  };

  // Real uploader using Supabase Storage -> writes resource doc to courses/.../resources
  const handleRealUpload = async (file: File) => {
    if (!activeSubject) return;
    setIsUploading(true);
    setUploadProgress(10); // initial progress
    setUploadSuccess(false);

    const semesterId = `semester-${selectedSemester}`;
    const courseId = selectedDegree.id;
    const subjectId = activeSubject.id;
    const unitNumber = selectedUnit;
    const filePath = `${courseId}/${semesterId}/${subjectId}/unit-${unitNumber}/${file.name}`;

    if (process.env.NODE_ENV === "development") {
      console.log("Supabase Storage Path:", filePath);
    }

    try {
      if (!supabase) {
        throw new Error("Missing Supabase environment variables");
      }

      // 1. Upload to Supabase Storage in 'study-materials' bucket
      const { data, error } = await supabase.storage
        .from("study-materials")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: "application/pdf"
        });

      if (error) {
        console.error("Supabase upload error:", {
          message: error.message,
          name: error.name,
          cause: error.cause
        });
        throw error;
      }
      
      setUploadProgress(60); // uploaded

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from("study-materials")
        .getPublicUrl(data.path);

      const fileUrl = publicUrlData.publicUrl;
      setUploadProgress(80);

      if (process.env.NODE_ENV === "development") {
        console.log("PDF Download URL:", fileUrl);
      }

      // 3. Save resource metadata to Firestore resources subcollection
      const resourcesRef = collection(
        db,
        "courses",
        courseId,
        "semesters",
        semesterId,
        "subjects",
        subjectId,
        "resources"
      );

      const resourceData = {
        title: `Unit ${unitNumber} Notes`,
        type: "unit_notes",
        unitNumber,
        fileName: file.name,
        fileUrl,
        storageProvider: "supabase",
        storagePath: data.path,
        courseId,
        semesterId,
        subjectId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(resourcesRef, resourceData);
      setUploadProgress(100);

      if (process.env.NODE_ENV === "development") {
        console.log("Firestore Resource Saved:", docRef.id);
      }

      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error("PDF upload failed:", err);
      setIsUploading(false);
      alert(`Upload failed: ${err.message}`);
    }
  };

  const visibleDegrees = adminUser?.role === "super_admin" 
    ? DEGREES 
    : DEGREES.filter(deg => adminUser?.faculties?.includes(deg.id));

  useEffect(() => {
    if (!authLoading && adminUser && visibleDegrees.length > 0) {
      if (!visibleDegrees.find(d => d.id === selectedDegree.id)) {
        setSelectedDegree(visibleDegrees[0]);
      }
    }
  }, [authLoading, adminUser, selectedDegree.id, visibleDegrees]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    const normalizedEmail = loginEmail.trim().toLowerCase();

    console.log("--- LOGIN ATTEMPT ---");
    console.log("ACTIVE FIREBASE PROJECT:", auth.app.options.projectId);
    console.log("NORMALIZED EMAIL:", normalizedEmail);
    console.log("PASSWORD LENGTH:", loginPassword.length);

    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, loginPassword);
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        console.error("FIREBASE AUTH CODE:", err.code);
        console.error("FIREBASE AUTH MESSAGE:", err.message);
        setLoginError(err.code || "Invalid email or password.");
      } else {
        console.error("UNKNOWN ERROR:", err);
        setLoginError("An unexpected error occurred.");
      }
    }
    setIsLoggingIn(false);
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    const normalizedEmail = loginEmail.trim().toLowerCase();
    
    if (!normalizedEmail) {
      setLoginError("Enter your admin email first.");
      return;
    }

    setLoginError("");
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      alert("Password reset email sent. Check your inbox and spam folder.");
    } catch (err: any) {
      console.error("FIREBASE AUTH CODE:", err.code);
      console.error("FIREBASE AUTH MESSAGE:", err.message);
      setLoginError(err.code || "Failed to send reset email.");
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-sans"><p className="text-sm font-bold animate-pulse">Authenticating Admin...</p></div>;
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-sans p-6 overflow-hidden relative perspective-1000">
        <div className="bg-grid-3d"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
        
        <TiltCard className="w-full max-w-md z-10">
          <div className="w-full p-8 glass neon-border rounded-3xl shadow-2xl space-y-6 translate-z-10 bg-card/40 backdrop-blur-xl">
            <div className="text-center space-y-2 relative z-20">
              <div className="mx-auto w-16 h-16 bg-primary/20 text-primary flex items-center justify-center rounded-2xl mb-4 shadow-[0_0_30px_rgba(79,70,229,0.3)] animate-pulse-slow border border-primary/30">
                <Database className="h-8 w-8 drop-shadow-md" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">Admin Portal Login</h2>
              <p className="text-xs font-bold text-muted-foreground/80 tracking-wide uppercase">Secure Authorization Gateway</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4 relative z-20">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-black/40 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all backdrop-blur-sm shadow-inner"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Password</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-[10px] font-bold text-primary hover:text-secondary hover:underline cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-black/40 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all backdrop-blur-sm shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {loginError && <p className="text-xs font-bold text-destructive text-center p-2 bg-destructive/10 rounded-lg border border-destructive/20">{loginError}</p>}
              
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 text-xs font-extrabold tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all disabled:opacity-50 cursor-pointer transform hover:-translate-y-1 active:translate-y-0"
              >
                {isLoggingIn ? "Authenticating..." : "Secure Login"}
              </button>
            </form>
          </div>
        </TiltCard>
      </div>
    );
  }

  if (adminUser && !adminUser.active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-sans p-6">
        <div className="text-center p-8 bg-card border border-border rounded-3xl shadow-sm space-y-4 max-w-sm w-full">
          <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-2xl mb-2">
            <Settings className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Access Denied</h2>
          <p className="text-xs font-semibold text-muted-foreground">Your admin account is currently disabled. Please contact a Super Admin.</p>
          <button onClick={() => auth.signOut()} className="mt-4 px-6 py-2 bg-muted hover:bg-muted/70 text-foreground text-xs font-bold uppercase rounded-xl transition-all cursor-pointer">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans relative overflow-hidden perspective-1000">
      <div className="bg-grid-3d opacity-50"></div>
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border/40 glass flex flex-col justify-between hidden md:flex shrink-0 relative z-30 shadow-2xl">
        <div>
          <div className="h-16 px-6 border-b border-border flex items-center gap-2 text-primary font-bold">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Database className="h-6 w-6" />
            </div>
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NTR NOTES Admin
            </span>
          </div>

          <nav className="p-3.5 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-300 cursor-pointer relative group
                ${activeTab === "dashboard" 
                  ? "bg-gradient-to-r from-primary/80 to-primary/40 text-primary-foreground shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-primary/50 translate-x-2" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"}`}
            >
              <LayoutDashboard className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Console</span>
              {activeTab === "dashboard" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-l-xl shadow-[0_0_10px_white]"></div>}
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-300 cursor-pointer relative group
                ${activeTab === "curriculum" 
                  ? "bg-gradient-to-r from-primary/80 to-primary/40 text-primary-foreground shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-primary/50 translate-x-2" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"}`}
            >
              <GraduationCap className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Curriculum</span>
              {activeTab === "curriculum" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-l-xl shadow-[0_0_10px_white]"></div>}
            </button>
            <button
              onClick={() => {
                setActiveTab("materials");
                if (activeSubjects.length > 0 && !activeSubject) {
                  handleManageSubject(activeSubjects[0]);
                }
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-300 cursor-pointer relative group
                ${activeTab === "materials" 
                  ? "bg-gradient-to-r from-primary/80 to-primary/40 text-primary-foreground shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-primary/50 translate-x-2" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"}`}
            >
              <UploadCloud className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Materials</span>
              {activeTab === "materials" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-l-xl shadow-[0_0_10px_white]"></div>}
            </button>
            {adminUser?.role === "super_admin" && (
              <button
                onClick={() => setActiveTab("members")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-300 cursor-pointer relative group
                  ${activeTab === "members" 
                    ? "bg-gradient-to-r from-primary/80 to-primary/40 text-primary-foreground shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-primary/50 translate-x-2" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"}`}
              >
                <Users className="h-5 w-5 relative z-10" />
                <span className="relative z-10">Admins</span>
                {activeTab === "members" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-l-xl shadow-[0_0_10px_white]"></div>}
              </button>
            )}
          </nav>
        </div>

        <div className="border-t border-border p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">{adminUser?.name || "Admin"}</span>
              <span className="text-[10px] font-black uppercase text-muted-foreground">{adminUser?.role}</span>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-all cursor-pointer"
              title="Sign Out"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
          <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            <span>System Version: v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Frame */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/40 glass px-6 flex items-center justify-between shrink-0 shadow-md">
          <div>
            <h1 className="text-base font-extrabold capitalize tracking-tight flex items-center gap-1.5">
              Admin Portal
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-primary font-bold text-sm tracking-normal">
                {activeTab === "dashboard" ? "System Telemetry Overview" : activeTab === "curriculum" ? "Degree Mappings Builder" : activeTab === "materials" ? "Upload Materials" : "Manage Administrators"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak metrics */}
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 fill-emerald-500" />
              Database Online
            </span>

            {/* Mode switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Dynamic Page content */}
        <main className="flex-1 p-5 md:p-6 overflow-y-auto max-w-6xl w-full mx-auto space-y-6 animate-fade-in relative z-20">
          
          {/* TAB 1: CONSOLE DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Telemetry Metric boxes */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 perspective-1000">
                <TiltCard>
                  <div className="h-full glass neon-border p-5 rounded-3xl flex items-center gap-4 shadow-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all">
                    <div className="p-3 bg-primary/20 text-primary rounded-2xl shadow-inner border border-primary/30"><GraduationCap className="h-6 w-6 drop-shadow" /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest">Degrees Courses</p>
                      <p className="text-2xl font-black mt-0.5 drop-shadow-sm">5 Active</p>
                    </div>
                  </div>
                </TiltCard>
                <TiltCard>
                  <div className="h-full glass neon-border p-5 rounded-3xl flex items-center gap-4 shadow-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all" style={{ '--primary': '#3b82f6', '--secondary': '#06b6d4' } as any}>
                    <div className="p-3 bg-indigo-500/20 text-indigo-500 rounded-2xl shadow-inner border border-indigo-500/30"><BookOpen className="h-6 w-6 drop-shadow" /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Total Subjects</p>
                      <p className="text-2xl font-black mt-0.5 drop-shadow-sm">23 Subjects</p>
                    </div>
                  </div>
                </TiltCard>
                <TiltCard>
                  <div className="h-full glass neon-border p-5 rounded-3xl flex items-center gap-4 shadow-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all" style={{ '--primary': '#10b981', '--secondary': '#34d399' } as any}>
                    <div className="p-3 bg-teal-500/20 text-teal-500 rounded-2xl shadow-inner border border-teal-500/30"><FileText className="h-6 w-6 drop-shadow" /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest">Notes Uploaded</p>
                      <p className="text-2xl font-black mt-0.5 drop-shadow-sm">115 PDFs</p>
                    </div>
                  </div>
                </TiltCard>
                <TiltCard>
                  <div className="h-full glass neon-border p-5 rounded-3xl flex items-center gap-4 shadow-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all" style={{ '--primary': '#f59e0b', '--secondary': '#fbbf24' } as any}>
                    <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl shadow-inner border border-amber-500/30"><Users className="h-6 w-6 drop-shadow" /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Students Reading</p>
                      <p className="text-2xl font-black mt-0.5 drop-shadow-sm">1,240 Total</p>
                    </div>
                  </div>
                </TiltCard>
              </div>

              {/* Weekly Analytics Chart placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card border border-border p-5 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-base flex items-center gap-1.5"><TrendingUp className="h-5 w-5 text-primary" /> Downloads Analytics</h3>
                  <div className="h-44 flex items-end gap-3 pt-6 px-4">
                    {[12, 18, 15, 24, 30, 42, 55].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 bg-muted px-1.5 py-0.5 rounded border border-border mb-1">{val * 10}</span>
                        <div className="w-full bg-muted rounded-t-lg overflow-hidden h-full flex items-end">
                          <div className="w-full bg-primary rounded-t-lg group-hover:bg-secondary transition-all" style={{ height: `${(val / 55) * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground mt-1">Wk {idx+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-base">Students Activity Feed</h3>
                  <div className="space-y-3.5 max-h-44 overflow-y-auto pr-1">
                    {[
                      { text: "Alex Mercer opened Unit 1 PDF", subject: "B.Sc Math Sem 1", time: "5m ago" },
                      { text: "David Miller downloaded CS Syllabus", subject: "B.Sc CS Sem 3", time: "18m ago" },
                      { text: "Sarah Connor reviewed Literature Notes", subject: "BA English Sem 2", time: "2h ago" },
                    ].map((feed, idx) => (
                      <div key={idx} className="border-b border-border/40 pb-3 last:border-b-0 last:pb-0 text-xs">
                        <p className="font-bold text-foreground">{feed.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">{feed.subject} • {feed.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE CURRICULUM */}
          {activeTab === "curriculum" && (
            <div className="space-y-6">
              
              {/* Select degree & semester picker */}
              <TiltCard>
                <div className="glass neon-border p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-lg text-primary tracking-tight">Select Degree Scope</h3>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Choose course parameters to configure dynamic subjects lists.</p>
                    </div>
                    
                    {/* Stepper buttons */}
                    <div className="flex flex-wrap gap-2">
                      {visibleDegrees.map((deg) => (
                        <button
                          key={deg.id}
                          onClick={() => setSelectedDegree(deg)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer
                            ${selectedDegree.id === deg.id 
                              ? "bg-gradient-to-r from-primary to-secondary border-transparent text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] transform -translate-y-1" 
                              : "bg-black/40 border-border/40 hover:bg-white/10 text-muted-foreground hover:text-foreground hover:border-primary/50"}`}
                        >
                          {deg.name}
                        </button>
                      ))}
                    </div>
                  </div>
  
                  <div className="border-t border-border/40 pt-4 flex flex-wrap gap-3 items-center relative z-10">
                    <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest pr-2">Semester:</span>
                    {Array.from({ length: selectedDegree.semestersCount }, (_, i) => i + 1).map((semNum) => (
                      <button
                        key={semNum}
                        onClick={() => setSelectedSemester(semNum)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border
                          ${selectedSemester === semNum 
                            ? "bg-secondary border-transparent text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] transform -translate-y-1" 
                            : "bg-black/40 border-border/40 hover:bg-white/10 text-muted-foreground hover:text-foreground hover:border-secondary/50"}`}
                      >
                        Semester {semNum}
                      </button>
                    ))}
                  </div>
                </div>
              </TiltCard>

              {/* Main curriculum grid block */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Columns: Subject listings table */}
                <TiltCard className="lg:col-span-2">
                  <div className="h-full glass neon-border p-5 rounded-3xl space-y-4 shadow-xl">
                    <h3 className="font-extrabold text-lg tracking-tight relative z-10 text-primary">
                      Active Subjects for {selectedDegree.name} Sem {selectedSemester}
                    </h3>
                    
                    <div className="space-y-3 relative z-10">
                      {activeSubjects.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No subjects added to this curriculum slot yet.</p>
                      ) : (
                        activeSubjects.map((sub) => (
                          <div key={sub.id} className="p-4 bg-black/40 border border-border/40 rounded-2xl flex items-start justify-between gap-4 group hover:bg-white/5 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                            <div>
                              <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{sub.code}</span>
                              <h4 className="font-extrabold text-sm text-foreground mt-0.5">{sub.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-normal line-clamp-1">{sub.description}</p>
                            </div>
                            
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleManageSubject(sub)}
                                className="px-3 py-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-white text-[10px] font-extrabold rounded-lg transition-all cursor-pointer shadow-inner"
                              >
                                Update Files
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(sub.id)}
                                className="p-1.5 text-muted-foreground hover:text-white hover:bg-destructive hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-lg cursor-pointer transition-all"
                                title="Delete Subject"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TiltCard>

                {/* Right 1 Column: Add Subject Form */}
                <TiltCard>
                  <div className="h-full glass neon-border p-5 rounded-3xl shadow-xl">
                    <h3 className="font-extrabold text-lg border-b border-border/40 pb-3 flex items-center gap-2 relative z-10 text-primary">
                      <Plus className="h-5 w-5" /> Add Curriculum Subject
                    </h3>
                    
                    <form onSubmit={handleAddSubject} className="space-y-4 pt-3 relative z-10">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subject Name</label>
                        <input
                          type="text"
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subject Code</label>
                        <input
                          type="text"
                          value={newSubCode}
                          onChange={(e) => setNewSubCode(e.target.value)}
                          placeholder="e.g. CS-301"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</label>
                        <textarea
                          value={newSubDesc}
                          onChange={(e) => setNewSubDesc(e.target.value)}
                          placeholder="Short description..."
                          rows={2}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-xs font-extrabold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] cursor-pointer transition-transform hover:-translate-y-1"
                      >
                        Save Subject
                      </button>
                    </form>
                  </div>
                </TiltCard>
              </div>
            </div>
          )}

          {/* TAB 3: STUDY MATERIALS UPLOADER */}
          {activeTab === "materials" && (
            <div className="space-y-6">
              
              {/* Dynamic parameters selection or redirect check */}
              {!activeSubject ? (
                <TiltCard>
                  <div className="text-center py-16 glass neon-border rounded-3xl space-y-4 shadow-xl relative z-10">
                    <p className="text-sm font-semibold text-muted-foreground/80 tracking-wide uppercase">Select a curriculum subject first to upload syllabus or PDF study files.</p>
                    <button 
                      onClick={() => setActiveTab("curriculum")}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] cursor-pointer hover:-translate-y-1 transition-transform"
                    >
                      Go Select Subject
                    </button>
                  </div>
                </TiltCard>
              ) : (
                /* Materials edit panel */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Syllabus Textarea Editor & Subject Settings */}
                  <div className="space-y-6">
                    <TiltCard>
                      <div className="glass neon-border p-5 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between min-h-[420px]">
                        <div className="space-y-4 relative z-10">
                          <div className="flex justify-between items-center border-b border-border/40 pb-3">
                            <div>
                              <span className="text-[10px] font-black text-secondary uppercase tracking-widest drop-shadow">{activeSubject.code} Syllabus Editor</span>
                              <h3 className="font-extrabold text-lg tracking-tight mt-0.5 text-primary">{activeSubject.name}</h3>
                            </div>
                            <button
                              onClick={handleSaveSyllabus}
                              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-xs font-extrabold tracking-widest uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(79,70,229,0.4)] transform hover:-translate-y-1"
                            >
                              <Save className="h-4 w-4" />
                              <span>Save Text</span>
                            </button>
                          </div>

                          <textarea
                            value={syllabusText}
                            onChange={(e) => setSyllabusText(e.target.value)}
                            placeholder="Type syllabus details here..."
                            rows={10}
                            className="w-full bg-black/40 border border-border/50 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all backdrop-blur-sm shadow-inner"
                          />
                        </div>
                        <p className="text-[10px] text-secondary font-bold mt-2 leading-normal relative z-10">
                          <Sparkles className="inline h-3 w-3 mr-1" />
                          Saving updates the syllabus text in the curriculum database. Students viewing this syllabus will dynamically see updates instantly.
                        </p>
                      </div>
                    </TiltCard>

                    {/* Subject Settings Card */}
                    <TiltCard>
                      <div className="glass neon-border p-5 rounded-3xl space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b border-border/40 pb-3 relative z-10">
                          <div>
                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest drop-shadow">Metadata Settings</span>
                            <h3 className="font-extrabold text-lg mt-0.5 text-primary">Edit Subject Details</h3>
                          </div>
                          <button
                            onClick={handleSaveSettings}
                            className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-xs font-extrabold tracking-widest uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(79,70,229,0.4)] transform hover:-translate-y-1"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save Settings</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subject Name</label>
                            <input
                              type="text"
                              value={editSubName}
                              onChange={(e) => setEditSubName(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm shadow-inner"
                              placeholder="e.g. Computer Science"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subject Code</label>
                            <input
                              type="text"
                              value={editSubCode}
                              onChange={(e) => setEditSubCode(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm shadow-inner"
                              placeholder="e.g. CS-301"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 relative z-10">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</label>
                          <textarea
                            value={editSubDesc}
                            onChange={(e) => setEditSubDesc(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm shadow-inner"
                            placeholder="Short description..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </TiltCard>
                  </div>

                  {/* Right Column: PDF File drag uploader simulator */}
                  <TiltCard>
                    <div className="glass neon-border p-5 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between min-h-[460px]">
                      <div className="space-y-6 relative z-10">
                        <div className="border-b border-border/40 pb-3">
                          <span className="text-[10px] font-black text-secondary uppercase tracking-widest drop-shadow">Subject Notes PDF Uploader</span>
                          <h3 className="font-extrabold text-lg mt-0.5 text-primary">Upload Unit Notes PDFs</h3>
                        </div>

                        {/* Select Unit slot */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Select Target Unit Slot</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((unit) => (
                              <button
                                key={unit}
                                type="button"
                                onClick={() => setSelectedUnit(unit)}
                                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer
                                  ${selectedUnit === unit 
                                    ? "bg-secondary border-transparent text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] transform -translate-y-1" 
                                    : "bg-black/40 border-border/40 hover:bg-white/10 text-muted-foreground"}`}
                              >
                                Unit {unit}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Upload drag-n-drop box */}
                        <div 
                          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 backdrop-blur-sm
                            ${isUploading 
                              ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(79,70,229,0.2)]" 
                              : uploadSuccess 
                                ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                                : "border-border/50 bg-black/20 hover:border-primary/50 hover:bg-black/40"}`}
                        >
                          <div className={`p-3.5 rounded-2xl border shrink-0 shadow-inner
                            ${uploadSuccess 
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500" 
                              : "bg-black/40 border-border/50 text-muted-foreground"}`}>
                            <UploadCloud className={`h-8 w-8 ${isUploading ? "animate-pulse text-primary drop-shadow-[0_0_10px_rgba(79,70,229,0.5)]" : ""}`} />
                          </div>
                          
                          {isUploading ? (
                            <div className="w-full space-y-2 max-w-xs mx-auto">
                              <p className="text-xs font-bold text-foreground">Uploading Unit {selectedUnit} notes file...</p>
                              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${uploadProgress}%` }} />
                              </div>
                              <span className="text-[10px] font-mono font-bold text-muted-foreground">{uploadProgress}%</span>
                            </div>
                          ) : uploadSuccess ? (
                            <div className="space-y-1">
                              <p className="text-xs font-black text-emerald-500 flex items-center justify-center gap-1 drop-shadow-sm">
                                <Sparkles className="h-3.5 w-3.5 fill-emerald-500" />
                                Unit {selectedUnit} PDF Uploaded Successfully!
                              </p>
                              <p className="text-[10px] text-muted-foreground font-semibold">Curriculum database synchronized.</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-foreground">Drag and drop Unit {selectedUnit} PDF here</p>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Supported formats: .pdf (Max size: 8MB)</p>
                            </div>
                          )}


                          {!isUploading && !uploadSuccess && (
                            <div className="relative z-[100] pointer-events-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  console.log("SELECT FILE BUTTON CLICKED");

                                  if (pdfInputRef.current) {
                                    pdfInputRef.current.click();
                                  } else {
                                    console.error("PDF INPUT REF IS NULL");
                                  }
                                }}
                                className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-xs font-extrabold tracking-widest uppercase rounded-xl transition-all cursor-pointer inline-block shadow-[0_0_15px_rgba(79,70,229,0.4)] relative z-[101] pointer-events-auto select-none"
                              >
                                Select File
                              </button>
                            </div>
                          )}

                        </div>
                      </div>

                      <div className="flex gap-2 relative z-10">
                        <button 
                          onClick={() => setActiveTab("curriculum")}
                          className="w-full py-3.5 bg-black/40 hover:bg-white/10 text-foreground border border-border/50 text-xs font-extrabold tracking-widest uppercase rounded-xl transition-all cursor-pointer text-center shadow-inner"
                        >
                          Back to Curriculum
                        </button>
                      </div>
                    </div>
                  </TiltCard>

                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADMIN MEMBERS */}
          {activeTab === "members" && adminUser?.role === "super_admin" && (
            <div className="space-y-6">
              
              <TiltCard>
                <div className="flex justify-between items-center glass neon-border p-5 rounded-3xl shadow-xl">
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-lg text-primary tracking-tight">Admin Members</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">Manage system administrators and editors.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingMember(!isAddingMember)}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-xs font-extrabold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all cursor-pointer flex items-center gap-1.5 relative z-10 transform hover:-translate-y-1"
                  >
                    <Plus className="h-4 w-4" />
                    {isAddingMember ? "Cancel" : "Add Member"}
                  </button>
                </div>
              </TiltCard>

              {isAddingMember && (
                <TiltCard>
                  <div className="glass neon-border p-5 rounded-3xl shadow-xl space-y-4">
                    <h3 className="font-extrabold text-lg text-primary border-b border-border/40 pb-3 relative z-10">New Member Setup</h3>
                    <form onSubmit={handleAddMember} className="space-y-4 pt-3 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Name</label>
                          <input type="text" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm shadow-inner" required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email</label>
                          <input type="email" value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm shadow-inner" required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Password</label>
                          <input type="password" value={memberForm.password} onChange={e => setMemberForm({...memberForm, password: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm shadow-inner" required minLength={6} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Role</label>
                          <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-black/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm shadow-inner text-foreground">
                            <option value="editor" className="bg-background">Editor</option>
                            <option value="admin" className="bg-background">Admin</option>
                            <option value="super_admin" className="bg-background">Super Admin</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Assigned Faculties</label>
                        <div className="flex flex-wrap gap-3">
                          {DEGREES.map((deg) => (
                            <label key={deg.id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={memberForm.faculties.includes(deg.id)}
                                onChange={(e) => {
                                  const current = new Set(memberForm.faculties);
                                  if (e.target.checked) current.add(deg.id);
                                  else current.delete(deg.id);
                                  setMemberForm({...memberForm, faculties: Array.from(current)});
                                }}
                                className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-black/40"
                              />
                              {deg.name}
                            </label>
                          ))}
                        </div>
                      </div>

                      {memberError && <p className="text-xs font-bold text-destructive p-2 bg-destructive/10 rounded-lg border border-destructive/20">{memberError}</p>}

                      <button type="submit" disabled={isSubmittingMember} className="py-3 px-6 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-xs font-extrabold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-transform hover:-translate-y-1 disabled:opacity-50 cursor-pointer">
                        {isSubmittingMember ? "Saving..." : "Save Member"}
                      </button>
                    </form>
                  </div>
                </TiltCard>
              )}

              <TiltCard>
                <div className="glass neon-border p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="space-y-3 relative z-10">
                    {adminMembers.map((member) => (
                      <div key={member.id} className="p-4 bg-black/40 border border-border/40 rounded-2xl flex items-start justify-between gap-4 group hover:bg-white/5 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                        <div>
                          <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                            {member.name}
                            <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${member.role === 'super_admin' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                              {member.role}
                            </span>
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                          <p className="text-[10px] font-semibold text-secondary mt-2 tracking-wide uppercase">
                            Faculties: {member.faculties?.length > 0 ? member.faculties.map((f: string) => f.toUpperCase()).join(", ") : "All (Super Admin)"}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleMemberActive(member)}
                            className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer shadow-inner
                              ${member.active ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/40 border border-emerald-500/30' : 'bg-black/40 text-muted-foreground hover:bg-white/10 border border-border/50'}`}
                          >
                            {member.active ? 'Active' : 'Disabled'}
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.uid)}
                            className="p-1.5 text-muted-foreground hover:text-white hover:bg-destructive hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-lg cursor-pointer transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>

            </div>
          )}

        </main>
      </div>

      {/* Hidden PDF file input — rendered OUTSIDE TiltCard to avoid 3D transform hit-test misalignment */}
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          console.log("PDF INPUT CHANGE EVENT");
          console.log("SELECTED PDF FILE:", file);
          if (file) {
            handleRealUpload(file);
          }
          e.currentTarget.value = "";
        }}
      />

    </div>
  );
}

