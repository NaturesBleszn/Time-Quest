import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserStats } from '../types';

interface PlantTrackerProps {
  stats: UserStats;
}

export function PlantTracker({ stats }: PlantTrackerProps) {
  const { plantStage: stage, plantHealth: health, streak, plantType = 'leafy', plantColor: baseColor = '#22c55e', plantPotColor: potColor = '#451a03' } = stats;
  const getPlantColor = () => {
    if (health < 25) return '#a16207'; // yellow-700
    if (health < 50) return '#eab308'; // yellow-500
    return baseColor;
  };
  const plantColor = getPlantColor();

  const getFlowerColor = () => {
    if (health < 25) return '#78716c'; // stone-500
    if (health < 50) return '#fbbf24'; // amber-400
    if (health < 75) return '#f87171'; // red-400
    return '#ec4899'; // pink-500
  };
  const flowerColor = getFlowerColor();

  // Calculate droop based on health interpolating between 0 and 45 degrees
  const damage = Math.max(0, (100 - health) / 100); 
  const baseDroop = damage * 45;
  const currentScale = 1 - (damage * 0.15); // drops to 0.85 scale at worst

  // Trigger a flourish when stage changes
  const [flourishKey, setFlourishKey] = useState(0);
  useEffect(() => {
    setFlourishKey(prev => prev + 1);
  }, [stage]);

  const renderLeafy = () => (
    <>
      {stage >= 1 && (
        <motion.path d="M 50 80 Q 45 55 50 30" stroke={plantColor} strokeWidth="4" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1, stroke: plantColor }} transition={{ duration: 0.8, ease: "easeOut" }} />
      )}
      {stage >= 1 && (
        <>
          <motion.path d="M 50 65 Q 35 60 40 50 Q 50 55 50 65" fill={plantColor} initial={{ scale: 0 }} animate={{ scale: [1, 1.05, 1], rotate: [-3, 3, -3], fill: plantColor, skewX: [-2, 2, -2] }} style={{ transformOrigin: '50% 65%' }} transition={{ scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }, skewX: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }} />
          <motion.path d="M 48 55 Q 65 50 60 40 Q 48 45 48 55" fill={plantColor} initial={{ scale: 0 }} animate={{ scale: [1, 1.05, 1], rotate: [3, -3, 3], fill: plantColor, skewX: [2, -2, 2] }} style={{ transformOrigin: '48% 55%' }} transition={{ scale: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 2.7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }, skewX: { duration: 2.9, repeat: Infinity, ease: 'easeInOut' } }} />
        </>
      )}
      {stage >= 2 && (
        <>
          <motion.path d="M 48 45 Q 30 35 35 25 Q 45 35 48 45" fill={plantColor} initial={{ scale: 0 }} animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2], fill: plantColor }} style={{ transformOrigin: '50% 45%' }} transition={{ scale: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: 0.7 } }} />
          <motion.path d="M 49 35 Q 70 25 65 15 Q 55 25 49 35" fill={plantColor} initial={{ scale: 0 }} animate={{ scale: [1, 1.05, 1], rotate: [2, -2, 2], fill: plantColor }} style={{ transformOrigin: '50% 35%' }} transition={{ scale: { duration: 3.1, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.9 } }} />
        </>
      )}
      {stage >= 3 && (
        <motion.g initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: [0, 5, 0] }} style={{ transformOrigin: '50% 30%' }} transition={{ scale: { duration: 0.7, type: 'spring', bounce: 0.4, delay: 0.5 }, rotate: { duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }}>
          <motion.circle cx="50" cy="22" r="7" animate={{ fill: flowerColor }} />
          <motion.circle cx="57" cy="30" r="7" animate={{ fill: flowerColor }} />
          <motion.circle cx="53" cy="38" r="7" animate={{ fill: flowerColor }} />
          <motion.circle cx="43" cy="34" r="7" animate={{ fill: flowerColor }} />
          <motion.circle cx="41" cy="26" r="7" animate={{ fill: flowerColor }} />
          <circle cx="50" cy="30" r="4" fill="#fbbf24" />
        </motion.g>
      )}
    </>
  );

  const renderCactus = () => (
    <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: '50% 80%' }}>
      {stage >= 1 && (
        <motion.rect x="42" y={80 - (stage * 15)} width="16" height={stage * 15} rx="8" fill={plantColor} />
      )}
      {stage >= 2 && (
        <>
          <motion.path d={`M 42 ${80 - (stage * 8)} Q 25 ${80 - (stage * 8)} 25 ${80 - (stage * 12)}`} stroke={plantColor} strokeWidth="10" strokeLinecap="round" fill="none" />
          <motion.path d={`M 58 ${80 - (stage * 5)} Q 75 ${80 - (stage * 5)} 75 ${80 - (stage * 9)}`} stroke={plantColor} strokeWidth="10" strokeLinecap="round" fill="none" />
        </>
      )}
      {stage >= 3 && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformOrigin: `50% ${80 - (stage * 15)}` }}>
          <motion.path d={`M 45 ${80 - (stage * 15)} L 50 ${70 - (stage * 15)} L 55 ${80 - (stage * 15)} Z`} fill={flowerColor} />
        </motion.g>
      )}
    </motion.g>
  );

  const renderBonsai = () => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformOrigin: '50% 80%' }}>
      {stage >= 1 && (
        <motion.path d="M 45 80 Q 40 60 55 45 Q 65 35 50 30" stroke="#78350f" strokeWidth="8" fill="none" strokeLinecap="round" />
      )}
      {stage >= 2 && (
        <motion.path d="M 50 55 Q 35 50 30 40" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
      )}
      {stage >= 3 && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <motion.circle cx="50" cy="30" r="15" fill={plantColor} opacity="0.9" />
          <motion.circle cx="40" cy="35" r="12" fill={plantColor} opacity="0.8" />
          <motion.circle cx="60" cy="35" r="12" fill={plantColor} opacity="0.8" />
          <motion.circle cx="30" cy="40" r="10" fill={plantColor} opacity="0.9" />
        </motion.g>
      )}
    </motion.g>
  );

  const renderFlower = () => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformOrigin: '50% 80%' }}>
      {stage >= 1 && (
        <motion.path d="M 50 80 L 50 35" stroke={plantColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {stage >= 2 && (
        <>
          <motion.path d="M 50 60 Q 30 50 30 40 Q 45 45 50 60" fill={plantColor} />
          <motion.path d="M 50 70 Q 70 60 70 50 Q 55 55 50 70" fill={plantColor} />
        </>
      )}
      {stage >= 3 && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }} transition={{ scale: { duration: 2, repeat: Infinity }, rotate: { duration: 4, repeat: Infinity } }} style={{ transformOrigin: '50% 35%' }}>
          {[...Array(12)].map((_, i) => (
             <motion.ellipse key={i} cx="50" cy="20" rx="4" ry="15" fill={flowerColor} style={{ transformOrigin: '50% 35px' }} transform={`rotate(${i * 30} 50 35)`} />
          ))}
          <circle cx="50" cy="35" r="6" fill="#451a03" />
        </motion.g>
      )}
    </motion.g>
  );

  return (
    <div className="bg-quest-card backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-end min-h-[220px]">
      <div className="absolute top-4 left-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-green-400">Focus Plant</h3>
        <div className="mt-1 flex flex-col gap-0.5">
          {stats.hasUsedRain && <span className="text-[8px] text-blue-300">🌧️ Watered by Rain</span>}
          {stats.hasUsedFire && <span className="text-[8px] text-orange-300">🔥 Warmed by Fire</span>}
          {stats.hasUsedWaves && <span className="text-[8px] text-cyan-300">🌊 Calmed by Waves</span>}
          {stats.highPriorityCompleted && stats.highPriorityCompleted > 0 && <span className="text-[8px] text-yellow-300">✨ {stats.highPriorityCompleted}x High Prio Quests</span>}
        </div>
      </div>
      
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
        <div className="text-xs font-mono font-bold px-2 py-1 bg-black/30 rounded-md text-white/80 border border-white/5">
           Health: <span className={health < 50 ? 'text-red-400' : 'text-green-400'}>{health}%</span>
        </div>
        {streak > 0 && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 animate-pulse">
            {streak}x Streak 🔥
          </div>
        )}
      </div>

      <div className="relative w-40 h-40 flex items-end justify-center mb-2">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
           <defs>
             <radialGradient id="wave-gradient" cx="50%" cy="50%" r="50%">
               <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
               <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
             </radialGradient>
           </defs>
           {/* Dirt / Pot */}
           <path d="M 25 85 L 75 85 L 70 100 L 30 100 Z" fill={potColor} />
           <path d="M 22 80 L 78 80 L 78 85 L 22 85 Z" fill="#292524" opacity="0.5" />

           <motion.g 
             initial={false}
             animate={{ 
               scale: currentScale, 
               rotate: [baseDroop - 1.5, baseDroop + 1.5],
             }}
             style={{ transformOrigin: '50% 80%' }}
             transition={{ 
               rotate: { duration: 3.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
               scale: { duration: 1 }
             }}
           >
             {/* Seed (Stage 0) */}
             {stage === 0 && (
                <ellipse cx="50" cy="78" rx="4" ry="3" fill="#fbbf24" />
             )}

             {/* Environment Effects based on Stats */}
             {stats.hasUsedRain && (
               <motion.g opacity={0.6}>
                 {[...Array(5)].map((_, i) => (
                   <motion.line
                     key={`rain-${i}`}
                     x1={30 + (i * 10)} y1={-20}
                     x2={25 + (i * 10)} y2={100}
                     stroke="#60a5fa" strokeWidth="1" strokeDasharray="10 20"
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ strokeDashoffset: [-100, 100], opacity: [0, 0.5, 0] }}
                     transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
                   />
                 ))}
               </motion.g>
             )}

             {stats.hasUsedFire && (
               <motion.g opacity={0.8}>
                 {[...Array(6)].map((_, i) => (
                   <motion.circle
                     key={`ember-${i}`}
                     r={1 + Math.random() * 1.5}
                     fill="#fb923c"
                     initial={{ x: 30 + Math.random() * 40, y: 90, opacity: 0, scale: 0 }}
                     animate={{ y: [90, 40 + Math.random() * 20], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                     transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: 'easeOut', delay: Math.random() * 3 }}
                   />
                 ))}
               </motion.g>
             )}

             {stats.hasUsedWaves && (
               <motion.ellipse
                 cx="50" cy="85" rx="35" ry="10"
                 fill="url(#wave-gradient)"
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1, 0.8] }}
                 transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
               />
             )}

             {/* Sparkles for High Priority Quests */}
             {stats.highPriorityCompleted && stats.highPriorityCompleted > 0 && (
                <motion.g>
                  {[...Array(Math.min(stats.highPriorityCompleted, 10))].map((_, i) => (
                    <motion.path
                      key={`sparkle-${i}`}
                      d="M 50 10 L 52 18 L 60 20 L 52 22 L 50 30 L 48 22 L 40 20 L 48 18 Z"
                      fill="#fcd34d"
                      initial={{ scale: 0, opacity: 0, rotate: 0 }}
                      animate={{ 
                        scale: [0, 0.5 + Math.random() * 0.5, 0], 
                        opacity: [0, 1, 0],
                        rotate: [0, 180] 
                      }}
                      style={{ 
                        transformOrigin: '50% 20%', 
                        x: -30 + Math.random() * 60, 
                        y: 10 + Math.random() * 40 
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 5 }}
                    />
                  ))}
                </motion.g>
             )}

             {plantType === 'leafy' && renderLeafy()}
             {plantType === 'cactus' && renderCactus()}
             {plantType === 'bonsai' && renderBonsai()}
             {plantType === 'flower' && renderFlower()}

             {/* Dramatic Flourish Particles on stage up */}
             <AnimatePresence>
               {flourishKey > 1 && health > 50 && (
                 <motion.g key={`flourish-${flourishKey}`}>
                   <motion.circle
                     cx="50" cy="30" r="15"
                     fill="none" stroke="#fbbf24" strokeWidth="2"
                     initial={{ scale: 0, opacity: 0.8 }}
                     animate={{ scale: 3, opacity: 0 }}
                     transition={{ duration: 1, ease: "easeOut" }}
                   />
                   {[...Array(8)].map((_, i) => (
                     <motion.circle
                       key={i}
                       cx="50"
                       cy="30"
                       r="3"
                       fill={flowerColor}
                       initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                       animate={{ 
                         scale: [0, 1.5, 0],
                         x: Math.cos((i * 45 * Math.PI) / 180) * 35,
                         y: Math.sin((i * 45 * Math.PI) / 180) * 35,
                         opacity: [1, 1, 0]
                       }}
                       transition={{ duration: 1.2, ease: 'easeOut' }}
                     />
                   ))}
                 </motion.g>
               )}
             </AnimatePresence>
           </motion.g>
        </svg>
      </div>
      <div className="text-[10px] text-quest-muted uppercase tracking-widest font-semibold mt-2">
        {stage === 0 && 'Planted Seed'}
        {stage === 1 && 'Sprouting'}
        {stage === 2 && 'Growing Strong'}
        {stage >= 3 && 'Blooming'}
      </div>
    </div>
  );
}
