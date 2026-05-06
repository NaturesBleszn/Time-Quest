import React, { useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TimerMode } from '../hooks/useTimer';

import { CustomColorPalette } from '../types';

export type TimerTheme = 'frosted' | 'minimalist' | 'neon' | 'vintage' | 'cyberpunk' | 'fantasy' | 'retro';

interface TimerHUDProps {
  timeLeft: number;
  totalTime: number;
  mode: TimerMode;
  questTitle: string;
  onStartPause: () => void;
  onStop: () => void;
  theme?: TimerTheme;
  customPalette?: CustomColorPalette;
}

export function TimerHUD({ timeLeft, totalTime, mode, questTitle, onStartPause, onStop, theme = 'frosted', customPalette }: TimerHUDProps) {
  const [isHoverPlay, setIsHoverPlay] = useState(false);
  const [isHoverStop, setIsHoverStop] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Theme dictionaries
  const containerClasses: Record<TimerTheme, string> = {
    frosted: "flex flex-col items-center justify-center p-8 bg-quest-card backdrop-blur-xl rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/10",
    minimalist: "flex flex-col items-center justify-center p-8 bg-black rounded-none border border-white/10 relative overflow-hidden",
    neon: "flex flex-col items-center justify-center p-8 bg-slate-950 rounded-xl border border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.15)] relative overflow-hidden",
    vintage: "flex flex-col items-center justify-center p-8 bg-amber-50 rounded-sm border-4 border-amber-900 shadow-[8px_8px_0_0_rgba(120,53,15,1)] relative overflow-hidden font-serif",
    cyberpunk: "flex flex-col items-center justify-center p-8 bg-black rounded-sm border border-yellow-400 shadow-[4px_4px_0_0_rgba(250,204,21,0.5)] relative overflow-hidden",
    fantasy: "flex flex-col items-center justify-center p-8 bg-indigo-950 rounded-[2rem] border-4 border-amber-400/50 shadow-[0_0_40px_rgba(79,70,229,0.3)] relative overflow-hidden",
    retro: "flex flex-col items-center justify-center p-8 bg-[#1e1e24] rounded-sm border-8 border-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden"
  };

  const titleClasses: Record<TimerTheme, string> = {
    frosted: "text-xl font-display text-quest-accent mb-8 uppercase tracking-widest bg-black/20 px-6 py-2 rounded-full border border-quest-accent/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-center",
    minimalist: "text-sm font-sans text-white/50 mb-8 uppercase tracking-[0.3em] text-center",
    neon: "text-xl font-mono text-fuchsia-400 mb-8 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(217,70,239,0.8)] text-center border-b-2 border-fuchsia-500/30 pb-2 flex-wrap",
    vintage: "text-2xl font-serif text-amber-900 mb-8 tracking-wide font-bold uppercase text-center border-b-2 border-amber-900/20 pb-2",
    cyberpunk: "text-2xl font-mono text-yellow-400 mb-8 uppercase tracking-[0.2em] font-black underline decoration-yellow-400/50 decoration-4 underline-offset-4 text-center",
    fantasy: "text-3xl font-serif text-amber-200 mb-8 tracking-wider text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
    retro: "text-2xl font-mono text-white mb-8 uppercase tracking-widest font-black text-center"
  };

  const glowClasses: Record<TimerTheme, string> = {
    frosted: "absolute inset-0 bg-quest-accent/20 rounded-full blur-3xl group-hover:bg-quest-accent/30 transition-all duration-500",
    minimalist: "hidden",
    neon: "absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl",
    vintage: "hidden",
    cyberpunk: "absolute inset-0 bg-yellow-400/10 rounded-full blur-md opacity-50",
    fantasy: "absolute inset-0 bg-indigo-500/30 rounded-full blur-[40px] mix-blend-screen",
    retro: "hidden"
  };

  const trackClasses: Record<TimerTheme, string> = {
    frosted: "text-quest-bg stroke-current drop-shadow-xl",
    minimalist: "text-white/5 stroke-current",
    neon: "text-slate-900 stroke-current",
    vintage: "text-amber-200 stroke-current drop-shadow-sm",
    cyberpunk: "text-zinc-900 stroke-current",
    fantasy: "text-indigo-900/50 stroke-current",
    retro: "text-white/10 stroke-current"
  };

  const progressClasses: Record<TimerTheme, string> = {
    frosted: `stroke-current ${mode === 'break' ? 'text-quest-success' : 'text-quest-accent'}`,
    minimalist: "stroke-current text-white/80",
    neon: `stroke-current ${mode === 'break' ? 'text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)]' : 'text-cyan-400'} drop-shadow-[0_0_10px_currentColor]`,
    vintage: `stroke-current ${mode === 'break' ? 'text-emerald-800' : 'text-amber-800'}`,
    cyberpunk: `stroke-current ${mode === 'break' ? 'text-cyan-400' : 'text-yellow-400'}`,
    fantasy: `stroke-current ${mode === 'break' ? 'text-emerald-300' : 'text-amber-300'} drop-shadow-[0_0_8px_currentColor]`,
    retro: `stroke-current ${mode === 'break' ? 'text-green-400' : 'text-white'}`
  };

  const timerTextClasses: Record<TimerTheme, string> = {
    frosted: "text-6xl font-mono font-bold tracking-tighter text-white drop-shadow-md",
    minimalist: "text-7xl font-sans font-extralight tracking-tighter text-white",
    neon: "text-6xl font-mono font-bold tracking-widest text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]",
    vintage: "text-6xl font-serif font-black tracking-tight text-amber-950",
    cyberpunk: "text-7xl font-mono font-black tracking-tighter text-yellow-400",
    fantasy: "text-7xl font-serif font-bold tracking-tight text-amber-100 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]",
    retro: "text-6xl font-mono font-black tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
  };

  const timerSubtextClasses: Record<TimerTheme, string> = {
    frosted: "text-quest-muted mt-2 text-sm uppercase tracking-widest font-semibold",
    minimalist: "text-white/30 mt-2 text-xs uppercase tracking-[0.2em]",
    neon: "text-cyan-400/80 mt-2 text-xs uppercase tracking-widest font-mono",
    vintage: "text-amber-700/80 mt-2 text-sm uppercase tracking-widest font-serif font-bold italic",
    cyberpunk: "text-cyan-400 mt-2 text-xs uppercase tracking-[0.3em] font-mono",
    fantasy: "text-indigo-300 mt-2 text-sm uppercase tracking-widest font-serif",
    retro: "text-white/70 mt-2 text-xs uppercase tracking-widest font-mono"
  };

  const playBtnClasses: Record<TimerTheme, string> = {
    frosted: "w-16 h-16 flex items-center justify-center rounded-full bg-white text-indigo-950 transition-all font-bold transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.4)] focus:outline-none focus:ring-4 focus:ring-quest-accent",
    minimalist: "w-16 h-16 flex items-center justify-center rounded-full bg-transparent border border-white hover:bg-white hover:text-black text-white transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50",
    neon: "w-16 h-16 flex items-center justify-center rounded-full bg-slate-900 border-2 border-cyan-400 hover:bg-cyan-400 text-cyan-400 hover:text-slate-900 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)] transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-500/50",
    vintage: "w-16 h-16 flex items-center justify-center rounded-full bg-amber-800 text-amber-50 hover:bg-amber-900 transition-all border-2 border-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,1)] active:shadow-none active:translate-y-1 active:translate-x-1 focus:outline-none focus:ring-2 focus:ring-amber-900/50",
    cyberpunk: "w-16 h-16 flex items-center justify-center rounded-none bg-yellow-400 text-black hover:bg-yellow-300 transition-colors border border-yellow-400 shadow-[4px_4px_0_0_rgba(34,211,238,0.5)] active:shadow-none active:translate-y-1 active:translate-x-1",
    fantasy: "w-16 h-16 flex items-center justify-center rounded-full bg-amber-500 text-indigo-950 hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] transform hover:scale-110 active:scale-95 border-2 border-amber-200",
    retro: "w-16 h-16 flex items-center justify-center rounded-none bg-green-500 text-white hover:bg-green-400 transition-colors border-4 border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
  };

  const stopBtnClasses: Record<TimerTheme, string> = {
    frosted: "w-16 h-16 flex items-center justify-center rounded-full bg-quest-bg hover:bg-slate-700 text-quest-muted hover:text-white transition-all transform hover:scale-110 ring-2 ring-quest-muted/30 hover:ring-quest-muted/50 focus:outline-none focus:ring-4 focus:ring-quest-accent",
    minimalist: "w-16 h-16 flex items-center justify-center rounded-full bg-transparent border border-white/20 hover:border-white/60 text-white/50 hover:text-white transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50",
    neon: "w-16 h-16 flex items-center justify-center rounded-full bg-slate-900 border border-fuchsia-500/50 hover:border-fuchsia-400 hover:bg-fuchsia-500/10 text-fuchsia-500 hover:text-fuchsia-300 transition-all shadow-[0_0_10px_rgba(217,70,239,0.3)] transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-fuchsia-500/50",
    vintage: "w-16 h-16 flex items-center justify-center rounded-full bg-amber-200 text-amber-900 hover:bg-amber-300 transition-all border-2 border-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,1)] active:shadow-none active:translate-y-1 active:translate-x-1 focus:outline-none focus:ring-2 focus:ring-amber-900/50",
    cyberpunk: "w-16 h-16 flex items-center justify-center rounded-none bg-black text-cyan-400 hover:bg-zinc-900 transition-colors border border-cyan-400 shadow-[4px_4px_0_0_rgba(250,204,21,0.5)] active:shadow-none active:translate-y-1 active:translate-x-1",
    fantasy: "w-16 h-16 flex items-center justify-center rounded-full bg-indigo-900 text-amber-200 hover:bg-indigo-800 transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] transform hover:scale-110 active:scale-95 border-2 border-amber-500/30",
    retro: "w-16 h-16 flex items-center justify-center rounded-none bg-red-500 text-white hover:bg-red-400 transition-colors border-4 border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
  };

  return (
    <div className={containerClasses[theme]} style={customPalette ? { backgroundColor: customPalette.background, borderColor: customPalette.primary } : undefined}>
      {/* Background decoration for frosted */}
      {theme === 'frosted' && <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />}
      
      <h2 className={titleClasses[theme]} style={customPalette ? { color: customPalette.primary, borderColor: customPalette.primary } : undefined}>
        <AnimatePresence mode="wait">
          <motion.span
            key={mode === 'break' ? 'Rest Camp' : questTitle}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {mode === 'break' ? 'Rest Camp' : questTitle}
          </motion.span>
        </AnimatePresence>
      </h2>

      <div className="relative flex items-center justify-center mb-10 group mt-4">
        <div className={glowClasses[theme]} style={customPalette ? { backgroundColor: customPalette.primary, opacity: 0.2 } : undefined} />
        
        <svg className="w-72 h-72 transform -rotate-90 relative z-10" viewBox="0 0 260 260">
          <circle
            className={trackClasses[theme]}
            strokeWidth={theme === 'minimalist' ? "2" : (theme === 'vintage' ? "14" : "8")}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="130"
            cy="130"
            style={customPalette ? { color: customPalette.background, opacity: 0.5 } : undefined}
          />
          <motion.circle
             className={progressClasses[theme]}
             strokeWidth={theme === 'minimalist' ? "4" : (theme === 'vintage' ? "10" : "12")}
             strokeLinecap={theme === 'vintage' ? "square" : "round"}
             fill="transparent"
             r={radius}
             cx="130"
             cy="130"
             style={{ strokeDasharray: circumference, ...(customPalette ? { color: customPalette.primary, stroke: customPalette.primary } : {}) }}
             initial={{ strokeDashoffset: circumference }}
             animate={{ 
               strokeDashoffset,
               opacity: mode === 'paused' ? 0.3 : 1
             }}
             transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center z-20">
          <motion.span 
            className={timerTextClasses[theme]} 
            style={customPalette ? { color: customPalette.text } : undefined}
            animate={{ opacity: mode === 'paused' ? 0.5 : 1 }}
            transition={{ duration: 0.8, repeat: mode === 'paused' ? Infinity : 0, repeatType: 'reverse' }}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className={timerSubtextClasses[theme]} style={customPalette ? { color: customPalette.primary } : undefined}>
            <AnimatePresence mode="wait">
              <motion.span
                key={mode === 'break' ? 'Recovery' : (mode === 'paused' ? 'Paused' : 'Time Remaining')}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {mode === 'break' ? 'Recovery' : (mode === 'paused' ? 'Paused' : 'Time Remaining')}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </div>

      <div className="flex space-x-6 relative z-10">
        <button
          aria-label={mode === 'running' || mode === 'break' ? 'Pause timer' : 'Start timer'}
          onClick={onStartPause}
          onMouseEnter={() => setIsHoverPlay(true)}
          onMouseLeave={() => setIsHoverPlay(false)}
          className={playBtnClasses[theme]}
          style={customPalette ? { 
            backgroundColor: isHoverPlay ? customPalette.background : customPalette.primary, 
            color: isHoverPlay ? customPalette.primary : customPalette.background, 
            borderColor: customPalette.primary 
          } : undefined}
        >
          {mode === 'running' || mode === 'break' ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
        </button>
        <button
          aria-label="Stop timer"
          onClick={onStop}
          onMouseEnter={() => setIsHoverStop(true)}
          onMouseLeave={() => setIsHoverStop(false)}
          className={stopBtnClasses[theme]}
          style={customPalette ? { 
            color: isHoverStop ? customPalette.background : customPalette.primary, 
            borderColor: customPalette.primary, 
            backgroundColor: isHoverStop ? customPalette.primary : 'transparent' 
          } : undefined}
        >
          <Square fill="currentColor" size={20} />
        </button>
      </div>
    </div>
  );
}

