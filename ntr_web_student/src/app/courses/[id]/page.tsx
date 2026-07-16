"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSubjectById, StudyResource, Subject } from "@/data/curriculumData";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import {
  ArrowLeft,
  Copy,
  Check,
  FileText,
  BookOpen,
  Sparkles,
  Edit3,
  Bookmark,
  ExternalLink,
  Loader2,
  AlertCircle,
  Database,
  Terminal,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function SubjectMaterialsPage() {
  const params = useParams();
  const subjectId = params.id as string;

  // Parse Firestore path segments from subjectId (e.g. "bsc-sem1-cs")
  const parts = subjectId.split("-");
  const degreeId = parts[0] || "";
  const semPart = parts[1] || "";
  const semesterNum = parseInt(semPart.replace("sem", "")) || 0;
  const semesterId = `semester-${semesterNum}`;

  const degree = React.useMemo(() => {
    // Import DEGREES dynamically or just fetch from data
    const { DEGREES } = require("@/data/curriculumData");
    return DEGREES.find((d: any) => d.id === degreeId) || { name: degreeId.toUpperCase(), id: degreeId };
  }, [degreeId]);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [subjectLoading, setSubjectLoading] = useState(true);

  // Active view states
  const [activeTab, setActiveTab] = useState<"syllabus" | "notes">("syllabus");
  const [copied, setCopied] = useState(false);

  // Real-time Firestore resources
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  // Active PDF viewer state
  const [activePdf, setActivePdf] = useState<StudyResource | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Notes state
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>({});
  const [noteInput, setNoteInput] = useState("");

  // Real-time onSnapshot for subject details and resources
  useEffect(() => {
    if (!degreeId || !semesterNum || !subjectId) {
      setSubjectLoading(false);
      setResourcesLoading(false);
      return;
    }

    // 1. Fetch Subject Details from curriculum collection
    const subjectRef = doc(db, "curriculum", degreeId, "semesters", semesterNum.toString(), "subjects", subjectId);
    
    const unsubscribeSubject = onSnapshot(subjectRef, (docSnap) => {
      if (docSnap.exists()) {
        setSubject(docSnap.data() as Subject);
      } else {
        // Fallback to local if not in DB yet (e.g. static ones)
        const localData = getSubjectById(subjectId);
        if (localData?.subject) {
          setSubject(localData.subject);
        } else {
          setSubject(null);
        }
      }
      setSubjectLoading(false);
    }, (error) => {
      console.warn("Failed to load subject from Firestore:", error);
      const localData = getSubjectById(subjectId);
      if (localData?.subject) {
        setSubject(localData.subject);
      } else {
        setSubject(null);
      }
      setSubjectLoading(false);
    });

    // 2. Fetch Resources
    const resourcesRef = collection(
      db,
      "courses",
      degreeId,
      "semesters",
      semesterId,
      "subjects",
      subjectId,
      "resources"
    );

    const q = query(
      resourcesRef,
      where("type", "==", "unit_notes")
    );

    const unsubscribeResources = onSnapshot(
      q,
      (snapshot) => {
        let docs: StudyResource[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<StudyResource, "id">),
        }));
        
        // Sort client-side to avoid Firestore composite index requirement
        docs = docs.sort((a, b) => a.unitNumber - b.unitNumber);
        
        setResources(docs);
        setResourcesLoading(false);
        setResourcesError(null);
      },
      (error) => {
        console.error("Failed to load resources:", error);
        setResourcesError("Failed to load study materials. Please try again.");
        setResourcesLoading(false);
      }
    );

    return () => {
      unsubscribeSubject();
      unsubscribeResources();
    };
  }, [degreeId, semesterId, subjectId, semesterNum]);

  if (subjectLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary animate-pulse">Initializing Data Stream...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-black text-white uppercase tracking-widest">Target Not Found</h2>
        <Link href="/courses" className="text-primary text-sm font-bold uppercase tracking-widest hover:text-secondary transition-colors underline-offset-4 hover:underline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Return to Database
        </Link>
      </div>
    );
  }

  const handleCopySyllabus = () => {
    navigator.clipboard.writeText(subject.syllabus);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPdf = (resource: StudyResource) => {
    setActivePdf(resource);
    setActiveTab("notes");
    setPdfLoading(true);
    setNoteInput(personalNotes[resource.id] || "");
  };

  const handleSaveNotes = () => {
    if (!activePdf) return;
    setPersonalNotes(prev => ({ ...prev, [activePdf.id]: noteInput }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full px-4 py-8 relative z-10">
      {/* Top Header Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6 relative"
      >
        <div className="flex items-start gap-4">
          <Link
            href="/courses"
            className="p-3 border border-white/10 rounded-xl bg-black/40 hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer backdrop-blur-sm group shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-1">
              <span className="flex items-center gap-1.5"><Database className="h-3 w-3" /> {degree.name}</span>
              <span className="text-gray-600">/</span>
              <span className="flex items-center gap-1.5"><Terminal className="h-3 w-3" /> SEM {semesterNum}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mt-0.5 text-white flex items-center gap-3">
              {subject.name} 
              <span className="text-sm border border-secondary/50 bg-secondary/10 text-secondary px-2 py-0.5 rounded shadow-[0_0_10px_rgba(6,182,212,0.2)] tracking-widest">{subject.code}</span>
            </h1>
          </div>
        </div>

        {/* View Selection Toggle */}
        <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("syllabus")}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2
              ${activeTab === "syllabus"
                ? "bg-primary text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                : "text-gray-500 hover:text-gray-300"}`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Syllabus
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2
              ${activeTab === "notes"
                ? "bg-secondary text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "text-gray-500 hover:text-gray-300"}`}
          >
            <FileText className="h-3.5 w-3.5" /> Unit Notes
          </button>
        </div>
      </motion.div>

      {/* Main Grid split: Units list (Left) + Document Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Column: Units Selection Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="glass-panel border border-white/10 p-5 rounded-3xl space-y-4 h-full flex flex-col relative overflow-hidden">
            {/* Top scanning line for sci-fi look */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-gray-400 border-b border-white/5 pb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Available Datasets
            </h3>

            <div className="space-y-2 flex-1">
              {/* Syllabus Shortcut */}
              <button
                onClick={() => { setActiveTab("syllabus"); setActivePdf(null); }}
                className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group
                  ${activeTab === "syllabus"
                    ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                    : "bg-black/20 border-white/5 hover:border-white/20 text-gray-400 hover:text-white"}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeTab === "syllabus" ? "bg-primary" : "bg-transparent group-hover:bg-gray-600"}`} />
                <BookOpen className={`h-4 w-4 shrink-0 ${activeTab === "syllabus" ? "text-primary" : "text-gray-500"}`} />
                <span className="uppercase tracking-widest font-black text-[10px]">Subject Syllabus</span>
              </button>

              <div className="pt-4 pb-2 px-1 flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-white/5"></div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Unit Data</p>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>

              {/* Live Firestore resources list */}
              {resourcesLoading ? (
                <div className="flex items-center gap-3 text-xs text-primary py-4 px-2 bg-primary/5 rounded-xl border border-primary/10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-black uppercase tracking-widest text-[10px]">Syncing...</span>
                </div>
              ) : resourcesError ? (
                <div className="flex items-center gap-2 text-xs text-red-400 py-3 px-2 bg-red-500/10 rounded-xl border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-bold">{resourcesError}</span>
                </div>
              ) : resources.length === 0 ? (
                <div className="py-8 px-4 text-center space-y-2 bg-black/20 rounded-xl border border-white/5 border-dashed">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No Data Fragments</p>
                  <p className="text-[10px] text-gray-600 font-medium">Awaiting admin upload.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {resources.map((res) => {
                    const isActive = activePdf?.id === res.id && activeTab === "notes";
                    return (
                      <button
                        key={res.id}
                        onClick={() => handleOpenPdf(res)}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden group
                          ${isActive
                            ? "bg-secondary/20 border-secondary text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                            : "bg-black/20 border-white/5 hover:border-white/20 text-gray-400 hover:text-white"}`}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isActive ? "bg-secondary shadow-[0_0_10px_rgba(6,182,212,0.8)]" : "bg-transparent group-hover:bg-gray-600"}`} />
                        <div className="flex items-center gap-3 min-w-0 pl-1">
                          <FileText className={`h-4 w-4 shrink-0 ${isActive ? "text-secondary" : "text-gray-500"}`} />
                          <span className="truncate uppercase tracking-wider font-black text-[10px]">Unit {res.unitNumber}</span>
                        </div>
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_5px_rgba(6,182,212,1)]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Columns: Dynamic Content Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* SYLLABUS TAB VIEW */}
            {activeTab === "syllabus" && (
              <motion.div 
                key="syllabus"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
              >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/10 pb-4 relative z-10">
                  <h3 className="font-black text-lg tracking-widest uppercase text-white flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Curriculum Overview
                  </h3>
                  <button
                    onClick={handleCopySyllabus}
                    className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 text-gray-300 hover:text-white"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "DATA EXTRACTED" : "EXTRACT DATA"}</span>
                  </button>
                </div>

                {/* Syllabus Markdown View Box */}
                <div className="p-6 bg-black/50 border border-white/5 rounded-2xl whitespace-pre-wrap leading-relaxed text-[13px] font-medium text-gray-300 max-h-[500px] overflow-y-auto custom-scrollbar relative z-10 font-mono">
                  {subject.syllabus}
                </div>

                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3 relative z-10 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider leading-relaxed">
                    Syllabus data successfully synchronized. Select a Data Fragment from the left panel to initialize PDF viewer.
                  </p>
                </div>
              </motion.div>
            )}

            {/* NOTES PDF VIEWER TAB VIEW */}
            {activeTab === "notes" && (
              <motion.div 
                key="notes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {!activePdf ? (
                  <TiltCard maxTilt={5}>
                    <div className="glass-panel border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                      <div className="p-4 rounded-full bg-black/50 border border-white/10 text-gray-600 mb-2 shadow-inner">
                        <FileText className="h-12 w-12" />
                      </div>
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Awaiting PDF Initialization</p>
                      {resources.length === 0 && !resourcesLoading && (
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Database currently empty.</p>
                      )}
                    </div>
                  </TiltCard>
                ) : (
                  <>
                    {/* PDF Viewer Canvas Wrapper */}
                    <div
                      className={`glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 relative
                        ${isFullScreen ? "fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-4 md:p-8 rounded-none border-none" : ""}`}
                    >
                      {/* PDF Top Toolbar */}
                      <div className="h-14 px-5 bg-black/60 border-b border-white/5 flex items-center justify-between text-gray-200 shrink-0 select-none backdrop-blur-md relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]" />
                          <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[200px] sm:max-w-xs text-white">
                            {activePdf.fileName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Open PDF in new tab */}
                          <a
                            href={activePdf.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg hover:bg-white/10 cursor-pointer text-gray-400 hover:text-white flex items-center gap-2 border border-transparent hover:border-white/10 transition-all"
                            title="Open in external viewport"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">External View</span>
                          </a>
                          <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                          >
                            {isFullScreen ? "Minimize" : "Maximize"}
                          </button>
                        </div>
                      </div>

                      {/* PDF iframe */}
                      <div className="flex-1 overflow-auto bg-white min-h-[500px] relative">
                        {pdfLoading && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-12 h-12 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                              <p className="text-[10px] text-secondary font-black uppercase tracking-widest animate-pulse">Rendering Document...</p>
                            </div>
                          </div>
                        )}
                        <iframe
                          key={activePdf.id}
                          src={activePdf.fileUrl}
                          className="w-full h-full min-h-[500px] border-none"
                          title={activePdf.title}
                          onLoad={() => setPdfLoading(false)}
                          onError={() => {
                            setPdfLoading(false);
                          }}
                        />
                      </div>

                      {/* PDF Bottom Bar */}
                      <div className="h-10 px-5 bg-black/60 border-t border-white/5 flex items-center justify-between text-gray-400 shrink-0 select-none backdrop-blur-md">
                        <div className="text-[10px] font-black uppercase tracking-widest truncate max-w-xs">
                          {activePdf.title}
                        </div>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest">UNIT {activePdf.unitNumber}</span>
                      </div>
                    </div>

                    {/* PDF Document Side Notepad */}
                    <div className="glass-panel border border-white/10 p-6 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-accent" />
                          <h4 className="font-black text-xs uppercase tracking-widest text-white">Local Encrypted Notes</h4>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Input operational notes for this module..."
                          rows={3}
                          className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-xs font-mono font-medium text-gray-300 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-gray-700 custom-scrollbar"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handleSaveNotes}
                            className="px-6 py-2 bg-accent text-black hover:bg-white text-[10px] font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                          >
                            Save Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
