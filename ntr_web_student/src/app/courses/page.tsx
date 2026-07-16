"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DEGREES, getSubjectsForSemester, Degree, Subject } from "@/data/curriculumData";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import TiltCard from "@/components/TiltCard";
import { 
  GraduationCap, 
  ChevronRight, 
  Calendar, 
  BookOpen, 
  ArrowRight,
  Database
} from "lucide-react";

export default function CoursesPage() {
  const router = useRouter();
  
  // Selection states
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Stepper helper
  const step = !selectedDegree ? 1 : !selectedSemester ? 2 : 3;

  const handleDegreeSelect = (degree: Degree) => {
    setSelectedDegree(degree);
    setSelectedSemester(null);
  };

  const handleSemesterSelect = (semNum: number) => {
    setSelectedSemester(semNum);
  };

  const handleSubjectSelect = (subject: Subject) => {
    router.push(`/courses/${subject.id}`);
  };

  const handleResetStep = (targetStep: number) => {
    if (targetStep === 1) {
      setSelectedDegree(null);
      setSelectedSemester(null);
    } else if (targetStep === 2) {
      setSelectedSemester(null);
    }
  };

  // Sync subjects from Firestore
  useEffect(() => {
    if (!selectedDegree || !selectedSemester) {
      setSubjects([]);
      return;
    }

    setIsSyncing(true);
    const subjectsColRef = collection(db, "curriculum", selectedDegree.id, "semesters", selectedSemester.toString(), "subjects");
    
    const unsubscribe = onSnapshot(subjectsColRef, async (snapshot) => {
      const data: Subject[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        data.push({
          id: d.id,
          name: d.name,
          code: d.code,
          description: d.description,
          syllabus: d.syllabus
        });
      });
      
      if (data.length === 0) {
        const defaults = getSubjectsForSemester(selectedDegree.id, selectedSemester);
        setSubjects(defaults);
      } else {
        setSubjects(data);
      }
      setIsSyncing(false);
    }, (error) => {
      console.warn("Firestore collection sync blocked by permissions. Using static default curriculum.", error);
      const defaults = getSubjectsForSemester(selectedDegree.id, selectedSemester);
      setSubjects(defaults);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [selectedDegree, selectedSemester]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full px-4 py-8 relative z-10">
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-white mb-2 ring-1 ring-white/10 shadow-[0_0_30px_rgba(79,70,229,0.3)] backdrop-blur-md">
          <Database className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">
          Curriculum <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Matrix</span>
        </h1>
        <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto font-medium">
          Select your parameters to access syllabus data and operational unit notes.
        </p>
      </motion.div>

      {/* Breadcrumb Progress Indicator */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-4 rounded-2xl flex items-center flex-wrap gap-3 text-xs md:text-sm font-black text-gray-500 uppercase tracking-widest shadow-lg"
      >
        <button 
          onClick={() => handleResetStep(1)}
          className={`hover:text-primary transition-colors cursor-pointer flex items-center gap-2
            ${step === 1 ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : ""}`}
        >
          <span>Degree</span>
        </button>

        <ChevronRight className="h-4 w-4 text-gray-600 shrink-0" />

        <button 
          onClick={() => selectedDegree && handleResetStep(2)}
          disabled={!selectedDegree}
          className={`hover:text-secondary transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed
            ${step === 2 ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : ""} 
            ${selectedDegree && step !== 2 ? "text-gray-300" : ""}`}
        >
          {selectedDegree && (
            <span className="px-2.5 py-1 bg-primary/20 text-primary border border-primary/30 rounded-md">
              {selectedDegree.name}
            </span>
          )}
          <span>Semester</span>
        </button>

        <ChevronRight className="h-4 w-4 text-gray-600 shrink-0" />

        <span className={`flex items-center gap-2 ${step === 3 ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "opacity-30"}`}>
          {selectedSemester && (
            <span className="px-2.5 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-md">
              SEM {selectedSemester}
            </span>
          )}
          <span>Subject</span>
        </span>
      </motion.div>

      {/* STEP CONTENT SWITCHER */}
      <div className="min-h-[400px] perspective-container">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: DEGREE SELECTION */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, rotateX: -20, z: -100 }}
              animate={{ opacity: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, rotateX: 20, z: -100 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="space-y-6"
            >
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] text-center flex items-center justify-center gap-2">
                <div className="w-8 h-[1px] bg-gray-700"></div>
                Select Initialization Path
                <div className="w-8 h-[1px] bg-gray-700"></div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {DEGREES.map((deg, i) => (
                  <motion.div
                    key={deg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-full"
                  >
                    <TiltCard maxTilt={15} glow={true} className="h-full cursor-pointer" tiltReverse>
                      <div
                        onClick={() => handleDegreeSelect(deg)}
                        className="glass-panel p-6 h-full rounded-[2rem] hover:bg-white/5 transition-colors flex flex-col justify-between group overflow-hidden border border-white/5 hover:border-primary/50 relative"
                      >
                        {/* Abstract shape */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl group-hover:bg-primary/40 transition-colors" />
                        
                        <div className="space-y-4 relative z-10">
                          <div className={`text-4xl p-4 bg-black/50 border border-gray-700 w-fit rounded-2xl text-white shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                            {deg.icon}
                          </div>
                          <div>
                            <h3 className="font-black text-2xl text-white tracking-tight">{deg.name}</h3>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{deg.fullName}</p>
                            <p className="text-sm text-gray-400 mt-3 leading-relaxed font-medium">{deg.description}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-6 text-xs font-black text-gray-500 uppercase tracking-widest relative z-10">
                          <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                            {deg.semestersCount} Semesters
                          </span>
                          <span className="text-white group-hover:text-primary transition-colors flex items-center gap-1 group-hover:translate-x-2 transform duration-300">
                            Launch
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: SEMESTER SELECTION */}
          {step === 2 && selectedDegree && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ type: "spring" }}
              className="space-y-8"
            >
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] text-center flex items-center justify-center gap-2">
                <div className="w-8 h-[1px] bg-gray-700"></div>
                Initialize Semester Protocol
                <div className="w-8 h-[1px] bg-gray-700"></div>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {Array.from({ length: selectedDegree.semestersCount }, (_, i) => i + 1).map((semNum, i) => (
                  <motion.div
                    key={semNum}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TiltCard maxTilt={20} glow={true} tiltReverse>
                      <button
                        onClick={() => handleSemesterSelect(semNum)}
                        className="w-full relative group overflow-hidden rounded-3xl"
                      >
                        {/* Animated pill background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black border border-gray-700 group-hover:border-secondary/50 rounded-3xl transition-colors"></div>
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="relative p-6 md:p-8 flex flex-col items-center justify-center space-y-3 z-10">
                          <div className="p-3 rounded-xl bg-black/60 border border-gray-700 text-gray-300 group-hover:text-secondary group-hover:border-secondary/50 group-hover:scale-110 transition-all duration-300 shadow-inner">
                            <Calendar className="h-6 w-6" />
                          </div>
                          <h4 className="font-black text-xl text-white">SEM {semNum}</h4>
                        </div>
                      </button>
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUBJECT SELECTION */}
          {step === 3 && selectedDegree && selectedSemester && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] text-center flex items-center justify-center gap-2">
                <div className="w-8 h-[1px] bg-gray-700"></div>
                Target Acquired: Select Module
                <div className="w-8 h-[1px] bg-gray-700"></div>
              </h3>
              
              {isSyncing ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <p className="text-sm font-black text-primary uppercase tracking-widest animate-pulse">Syncing Data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {subjects.map((sub, i) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, type: "spring" }}
                      className="h-full"
                    >
                      <TiltCard maxTilt={10} glow={true} className="h-full cursor-pointer">
                        <div
                          onClick={() => handleSubjectSelect(sub)}
                          className="glass-panel p-6 h-full rounded-[2rem] hover:bg-white/5 transition-all flex flex-col justify-between space-y-6 group border border-white/5 hover:border-accent/50 relative overflow-hidden"
                        >
                           {/* Hover Scanline Effect */}
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-accent/50 shadow-[0_0_10px_#22C55E] opacity-0 group-hover:opacity-100 group-hover:animate-scanline pointer-events-none" />

                          <div className="space-y-3 relative z-10">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                              {sub.code}
                            </span>
                            <h4 className="font-black text-xl md:text-2xl text-white group-hover:text-accent transition-colors tracking-tight leading-tight">
                              {sub.name}
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                              {sub.description}
                            </p>
                          </div>

                          <div className="flex justify-between items-center border-t border-white/10 pt-4 text-xs font-black text-gray-500 uppercase tracking-widest relative z-10">
                            <span className="flex items-center gap-2 group-hover:text-gray-300 transition-colors">
                              <BookOpen className="h-4 w-4 text-accent" />
                              Data Available
                            </span>
                            <span className="text-white group-hover:text-accent transition-colors flex items-center gap-1 group-hover:translate-x-2 transform duration-300">
                              Access
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
