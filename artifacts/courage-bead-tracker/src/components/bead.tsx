import React from "react";
import { cn } from "@/lib/utils";

type BeadProps = {
  color: string;
  size?: number;
  className?: string;
  isGlow?: boolean;
};

export function BeadIcon({ color, size = 48, className, isGlow }: BeadProps) {
  const id = React.useId();

  // Special white handling because standard highlights look bad on #ffffff
  const isWhite = color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#fff";
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "rounded-full transition-transform duration-300", 
        isGlow && "drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]",
        className
      )}
      style={{
        filter: isGlow ? `drop-shadow(0 0 12px ${color})` : 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))'
      }}
    >
      <defs>
        {/* Main Base Gradient */}
        <radialGradient id={`base-${id}`} cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor={isWhite ? "#f8f8f8" : color} stopOpacity="1" />
          <stop offset="70%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={isWhite ? "#e0e0e0" : "#000000"} stopOpacity={isWhite ? "1" : "0.5"} />
        </radialGradient>

        {/* Top Highlight - Glass reflection */}
        <radialGradient id={`highlight-${id}`} cx="50%" cy="20%" r="40%" fx="50%" fy="10%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Bottom Bounce Light */}
        <radialGradient id={`bounce-${id}`} cx="50%" cy="85%" r="40%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={isWhite ? "0" : "0.4"} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`hole-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Main Bead Body */}
      <circle cx="50" cy="50" r="48" fill={`url(#base-${id})`} />
      
      {/* Bounce Light */}
      <circle cx="50" cy="50" r="48" fill={`url(#bounce-${id})`} />
      
      {/* Top Glass Highlight */}
      <ellipse cx="50" cy="25" rx="35" ry="18" fill={`url(#highlight-${id})`} transform="rotate(-15 50 25)" />

      {/* Bead Hole (Left) */}
      <ellipse cx="10" cy="50" rx="3" ry="8" fill={`url(#hole-${id})`} />
      {/* Bead Hole (Right) */}
      <ellipse cx="90" cy="50" rx="3" ry="8" fill={`url(#hole-${id})`} />
      
      {/* Little sparkle for glow beads */}
      {isGlow && (
        <path 
          d="M 65 20 Q 70 20 70 15 Q 70 20 75 20 Q 70 20 70 25 Q 70 20 65 20" 
          fill="white" 
          opacity="0.8"
        />
      )}
    </svg>
  );
}
