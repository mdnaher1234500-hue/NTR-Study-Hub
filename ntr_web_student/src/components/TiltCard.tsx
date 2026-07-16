"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltReverse?: boolean;
  maxTilt?: number;
  glow?: boolean;
}

export default function TiltCard({
  children,
  className,
  tiltReverse = false,
  maxTilt = 10,
  glow = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for tracking mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for the motion values
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // Transform raw mouse values into rotation degrees
  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    tiltReverse ? [maxTilt, -maxTilt] : [-maxTilt, maxTilt]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    tiltReverse ? [-maxTilt, maxTilt] : [maxTilt, -maxTilt]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the center of the card
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className={cn("perspective-container relative group", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={ref}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        initial={{ scale: 1, z: 0 }}
        animate={{ 
          scale: isHovered ? 1.02 : 1,
          z: isHovered ? 40 : 0
        }}
        transition={{ type: "spring", ...springConfig }}
        className="w-full h-full relative z-10"
      >
        {children}
      </motion.div>
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-[inherit] blur-md z-0 opacity-0 group-hover:opacity-100 transition duration-500"
          style={{ transform: "translateZ(-20px)" }}
        />
      )}
    </div>
  );
}
