import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean; // Kept for backward compatibility but ignored
  variant?: 'light' | 'dark';
}

export const Logo = ({ className, variant = 'dark' }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-3 w-fit", className)}>
      <div className="relative h-10 w-10 flex items-center justify-center shrink-0 group">
        {/* Outer Glow/Shadow */}
        <div className={cn(
          "absolute inset-0 rounded-xl blur-md opacity-20 transition-opacity group-hover:opacity-40",
          variant === 'dark' ? "bg-primary" : "bg-white"
        )} />
        
        {/* Main Logo Container */}
        <div className={cn(
          "relative h-full w-full rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
          variant === 'dark' 
            ? "bg-slate-900 border-primary text-white shadow-xl shadow-primary/20" 
            : "bg-white border-primary text-primary shadow-xl shadow-primary/10"
        )}>
          {/* Background Gradient Layer */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-10",
            variant === 'dark' ? "from-primary to-transparent" : "from-primary/50 to-transparent"
          )} />
          
          {/* Stylized Logo Content: A modern "M" with a premium feel */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <span className="text-2xl font-black italic tracking-tighter leading-none select-none">M</span>
              {/* Arabic Meem (م) accent */}
              <div className={cn(
                "absolute -top-1 -right-1 w-2 h-2 rounded-full border border-current opacity-50",
                variant === 'dark' ? "bg-primary" : "bg-primary"
              )} />
            </div>
            {/* Bottom accent line */}
            <div className="w-4 h-0.5 bg-primary rounded-full mt-0.5 opacity-80" />
          </div>
          
          {/* Glossy Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
        </div>
      </div>

      {/* Arabic Name with Modern Kufi Font - Responsive */}
      <div className="hidden sm:flex flex-col -space-y-1 text-right whitespace-nowrap">
        <span className={cn(
          "text-2xl font-bold font-kufi tracking-tight leading-none",
          variant === 'dark' ? "text-slate-900" : "text-white"
        )}>
          مزاجي
        </span>
        <span className={cn(
          "text-[10px] font-black font-geometric uppercase tracking-[0.2em] leading-none opacity-40",
          variant === 'dark' ? "text-slate-500" : "text-white/60"
        )}>
          MAZAGY
        </span>
      </div>
    </div>
  );
};
