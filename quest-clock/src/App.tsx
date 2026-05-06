import React, { useState, useEffect } from 'react';
import { Settings, Shield, Sword, Crown, Coffee, Volume2, VolumeX, Plus, CheckCircle, Circle, ArrowRight, Focus, Flame, Zap, FileText, ChevronDown, ChevronUp, LogIn, LogOut, Cloud, Star, Gem, CloudRain, Droplets, Hourglass, Timer, Trophy } from 'lucide-react';
import { TimerHUD, TimerTheme } from './components/TimerHUD';
import { useTimer } from './hooks/useTimer';
import { useSync } from './hooks/useSync';
import { Quest, Achievement, UserStats, INITIAL_ACHIEVEMENTS, TimerPreset } from './types';
import { audio } from './lib/audio';
import { getRandomQuote } from './lib/quotes';
import { PlantTracker } from './components/PlantTracker';
import { FocusZoneProtector } from './components/FocusZoneProtector';
import { Tooltip } from './components/Tooltip';
import { motion, AnimatePresence } from 'motion/react';

// Icons map for achievements
const IconMap: Record<string, React.ReactNode> = {
  Sword: <Sword size={20} />,
  Shield: <Shield size={20} />,
  Crown: <Crown size={20} />,
  Coffee: <Coffee size={20} />,
  Flame: <Flame size={20} />,
  Zap: <Zap size={20} />,
  Star: <Star size={20} />,
  Gem: <Gem size={20} />,
  CloudRain: <CloudRain size={20} />,
  Droplets: <Droplets size={20} />,
  Hourglass: <Hourglass size={20} />,
  Timer: <Timer size={20} />,
  Trophy: <Trophy size={20} />,
  Volume2: <Volume2 size={20} />,
};

const DEFAULT_PRESETS: TimerPreset[] = [
  { id: 'p1', name: 'Deep Work', durationMinutes: 50, isBreak: false },
  { id: 'p2', name: 'Short Break', durationMinutes: 5, isBreak: true },
  { id: 'p3', name: 'Long Rest', durationMinutes: 15, isBreak: true },
  { id: 'p4', name: 'Meditation', durationMinutes: 20, isBreak: true },
];

export default function App() {
  const [quests, setQuests] = useState<Quest[]>([
    { id: '1', title: 'Slay the Email Inbox', durationMinutes: 25, completed: false, xpReward: 50, notes: '', priority: 'low' },
    { id: '2', title: 'Draft Strategy Report', durationMinutes: 45, completed: false, xpReward: 100, notes: '', priority: 'high' },
  ]);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    totalXpEarned: 0,
    xpToNextLevel: 100,
    questsCompleted: 0,
    streak: 0,
    highestStreak: 0,
    plantHealth: 50,
    plantStage: 0,
    hasUsedRain: false,
    hasUsedFire: false,
    hasUsedWaves: false,
    hasFinishedLongQuest: false,
    hasFinishedShortQuest: false,
    hasTakenBreak: false,
  });

  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [presets, setPresets] = useState<TimerPreset[]>(DEFAULT_PRESETS);
  const [soundscape, setSoundscape] = useState<'none' | 'rain' | 'fire' | 'waves'>('none');
  const [showQuote, setShowQuote] = useState(false);
  const [quote, setQuote] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDuration, setNewQuestDuration] = useState('25');
  const [newQuestPriority, setNewQuestPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [blockedSites, setBlockedSites] = useState<string[]>(['reddit.com', 'twitter.com', 'tiktok.com']);
  const [toasts, setToasts] = useState<{id: string, title: string, icon: string}[]>([]);
  const [volume, setVolume] = useState(0.5);
  const [timerTheme, setTimerTheme] = useState<TimerTheme>('frosted');
  const [showPlantSettings, setShowPlantSettings] = useState(false);

  const { user, login, logout, syncing } = useSync(
    stats, setStats,
    quests, setQuests,
    achievements, setAchievements,
    presets, setPresets,
    blockedSites, setBlockedSites
  );

  const { timeLeft, totalTime, mode, start, pause, resume, stop } = useTimer({
    onComplete: () => {
      handleTimerComplete();
    },
    notificationMessage: activeQuest ? `Quest Complete: ${activeQuest.title}` : 'Timer Complete!',
  });

  useEffect(() => {
    audio.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    // Daily Reset Logic
    const lastPlayDate = localStorage.getItem('lastPlayDate');
    const today = new Date().toDateString();
    
    if (lastPlayDate !== today) {
      if (lastPlayDate !== null) { // Only clear if not first time load
         setQuests([{ id: Date.now().toString(), title: 'Start a New Day', durationMinutes: 25, completed: false, xpReward: 50, notes: 'Write your goals here...', priority: 'medium' }]);
      }
      localStorage.setItem('lastPlayDate', today);
    }
  }, []);

  useEffect(() => {
    if (soundscape === 'none') {
      audio.stopSoundscape();
    } else {
      audio.startSoundscape(soundscape);
    }
  }, [soundscape]);

  const toggleSoundscape = (type: 'rain' | 'fire' | 'waves') => {
    setSoundscape((prev) => {
      const next = prev === type ? 'none' : type;
      if (next !== 'none') {
        setStats((s) => ({
          ...s,
          plantHealth: Math.min(100, s.plantHealth + 2), // Tiny boost from sensory integration
          ...(next === 'rain' && { hasUsedRain: true }),
          ...(next === 'fire' && { hasUsedFire: true }),
          ...(next === 'waves' && { hasUsedWaves: true }),
        }));
      }
      return next;
    });
  };

  const handleTimerComplete = () => {
    if (mode === 'running' && activeQuest) {
      // Completed a quest
      completeQuest(activeQuest.id);
      setActiveQuest(null);
      setQuote(getRandomQuote());
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 5000);
      
      // Auto-start break? Prompt user. For now, just idle and maybe let them start a break
    } else if (mode === 'break') {
      // Break is over
      audio.playLevelUp(); // different sound could be used
    }
  };

  const stopQuestAndPenalize = () => {
    stop();
    if (mode === 'running' && activeQuest) {
      // Abandoned quest
      setStats((prev) => ({
        ...prev,
        streak: 0,
        plantHealth: Math.max(0, prev.plantHealth - 15),
      }));
    }
    setActiveQuest(null);
  };

  const completeQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    audio.playLevelUp();

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );

    let newStreak = stats.streak + 1;
    let newHighestStreak = Math.max(stats.highestStreak, newStreak);

    setStats((prev) => {
      let earnedXp = quest.xpReward + (newStreak > 1 ? 10 * newStreak : 0);
      let newXp = prev.xp + earnedXp; // streak bonus
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel++;
        newXpToNext = Math.floor(newXpToNext * 1.5);
      }

      let healthBonus = 15;
      if (quest.durationMinutes >= 60) healthBonus = 30;
      else if (quest.durationMinutes >= 45) healthBonus = 20;
      else if (quest.durationMinutes <= 15) healthBonus = 10;
      
      let newHealth = Math.min(100, prev.plantHealth + healthBonus);

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        totalXpEarned: (prev.totalXpEarned || 0) + earnedXp,
        xpToNextLevel: newXpToNext,
        questsCompleted: prev.questsCompleted + 1,
        highPriorityCompleted: (prev.highPriorityCompleted || 0) + (quest.priority === 'high' ? 1 : 0),
        streak: newStreak,
        highestStreak: newHighestStreak,
        plantHealth: newHealth,
        hasFinishedLongQuest: prev.hasFinishedLongQuest || quest.durationMinutes >= 60,
        hasFinishedShortQuest: prev.hasFinishedShortQuest || quest.durationMinutes <= 10,
      };
    });
  };

  useEffect(() => {
    let unlockedAny = false;
    let unlockedCount = 0;
    const newAchievements = achievements.map(ach => {
      if (ach.unlocked) {
        unlockedCount++;
        return ach;
      }
      let shouldUnlock = false;
      switch (ach.id) {
        case 'first_quest': shouldUnlock = stats.questsCompleted >= 1; break;
        case 'focus_novice': shouldUnlock = stats.questsCompleted >= 3; break;
        case 'focus_master': shouldUnlock = stats.questsCompleted >= 10; break;
        case 'break_time': shouldUnlock = !!stats.hasTakenBreak; break;
        case 'streak_3': shouldUnlock = stats.highestStreak >= 3; break;
        case 'streak_5': shouldUnlock = stats.highestStreak >= 5; break;
        case 'streak_10': shouldUnlock = stats.highestStreak >= 10; break;
        case 'streak_20': shouldUnlock = stats.highestStreak >= 20; break;
        case 'xp_100': shouldUnlock = (stats.totalXpEarned || 0) >= 100; break;
        case 'xp_500': shouldUnlock = (stats.totalXpEarned || 0) >= 500; break;
        case 'soundscape_rain': shouldUnlock = !!stats.hasUsedRain; break;
        case 'soundscape_fire': shouldUnlock = !!stats.hasUsedFire; break;
        case 'soundscape_waves': shouldUnlock = !!stats.hasUsedWaves; break;
        case 'soundscape_master': shouldUnlock = !!stats.hasUsedRain && !!stats.hasUsedFire && !!stats.hasUsedWaves; break;
        case 'long_quest': shouldUnlock = !!stats.hasFinishedLongQuest; break;
        case 'short_quest': shouldUnlock = !!stats.hasFinishedShortQuest; break;
        case 'high_priority_3': shouldUnlock = (stats.highPriorityCompleted || 0) >= 3; break;
      }
      if (shouldUnlock) {
        unlockedAny = true;
        unlockedCount++;
        const toastId = Date.now().toString() + ach.id;
        setToasts(prev => [...prev, { id: toastId, title: ach.title, icon: ach.icon }]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 4000);
        return { ...ach, unlocked: true };
      }
      return ach;
    });

    if (unlockedAny) {
      setAchievements(newAchievements);
    }
    
    // Plant Evolution Logic based on varied actions/achievements instead of just quest completion
    setStats(s => {
      let newStage = 0;
      if (unlockedCount >= 10 || s.highestStreak >= 5) {
        newStage = 3;
      } else if (unlockedCount >= 4 || s.streak >= 3) {
        newStage = 2;
      } else if (unlockedCount >= 1 || (s.totalXpEarned || 0) >= 50) {
        newStage = 1;
      }
      
      if (newStage > s.plantStage) {
          // Grew!
          return { ...s, plantStage: newStage };
      }
      return s;
    });
  }, [stats]);

  const startQuest = (quest: Quest) => {
    setActiveQuest(quest);
    start(quest.durationMinutes * 60);
    setFocusMode(false);
  };

  const startBreak = (minutes: number) => {
    setActiveQuest(null);
    start(minutes * 60, true);
    setStats(s => ({ 
      ...s, 
      hasTakenBreak: true,
      plantHealth: Math.min(100, s.plantHealth + 5) // Recovering helps plant health
    }));
  };

  const handleStartPause = () => {
    if (mode === 'idle') {
      if (activeQuest) start(activeQuest.durationMinutes * 60);
      else if (quests.find(q => !q.completed)) {
         startQuest(quests.find(q => !q.completed)!);
      }
    } else if (mode === 'running' || mode === 'break') {
      pause();
    } else if (mode === 'paused') {
      resume();
    }
  };

  const addQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim()) return;
    const duration = parseInt(newQuestDuration) || 25;
    
    setQuests([...quests, {
      id: Date.now().toString(),
      title: newQuestTitle,
      durationMinutes: duration,
      completed: false,
      xpReward: duration * 2,
      notes: '',
      priority: newQuestPriority
    }]);
    setNewQuestTitle('');
    setNewQuestPriority('medium');
  };

  const updateNotes = (notes: string) => {
    if (!activeQuest) return;
    setActiveQuest({ ...activeQuest, notes });
    setQuests((prev) => prev.map((q) => (q.id === activeQuest.id ? { ...q, notes } : q)));
  };

  const priorityMap = { high: 3, medium: 2, low: 1 };
  const sortedQuests = [...quests].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    const pA = priorityMap[a.priority || 'medium'];
    const pB = priorityMap[b.priority || 'medium'];
    return pB - pA;
  });

  if (focusMode) {
    return (
      <div className="min-h-screen flex flex-col p-8 relative overflow-hidden">
        {/* Background Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[150px] pointer-events-none z-0"></div>
        
        <button 
          onClick={() => setFocusMode(false)}
          className="absolute top-8 right-8 text-quest-muted hover:text-white flex items-center gap-2 px-4 py-2 rounded-full border border-quest-muted/30 z-50 backdrop-blur-md"
        >
          <Focus size={16} /> Exit Focus
        </button>
        <div className="max-w-[1400px] w-full mx-auto flex flex-col xl:flex-row gap-8 items-center xl:items-stretch justify-center flex-1">
          <div className="w-full xl:w-1/4 flex flex-col gap-6">
             <FocusZoneProtector 
               blockedSites={blockedSites}
               onAddSite={(site) => !blockedSites.includes(site) && setBlockedSites([...blockedSites, site])}
               onRemoveSite={(site) => setBlockedSites(blockedSites.filter(s => s !== site))}
             />
          </div>
          <div className="w-full xl:w-1/3 flex items-center justify-center">
             <TimerHUD
                timeLeft={timeLeft}
                totalTime={totalTime}
                mode={mode}
                questTitle={activeQuest?.title || 'No Active Quest'}
                onStartPause={handleStartPause}
                onStop={stopQuestAndPenalize}
                theme={timerTheme}
                customPalette={stats.themePalettes?.[timerTheme]}
              />
          </div>
          <div className="w-full xl:w-5/12 h-full min-h-[400px] flex flex-col bg-quest-card backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 relative z-10">
             <h3 className="text-quest-accent font-display font-bold text-xl mb-4 border-b border-white/10 pb-4">Quest Grimoire (Notes)</h3>
             <textarea 
               value={activeQuest?.notes || ''}
               onChange={(e) => updateNotes(e.target.value)}
               placeholder="Write your quest notes here..."
               className="flex-1 bg-transparent border-none outline-none resize-none text-white text-lg leading-relaxed placeholder-white/20 custom-scrollbar"
             />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Toasts */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="bg-quest-card backdrop-blur-xl border border-quest-accent/30 shadow-[0_4px_20px_rgba(99,102,241,0.3)] rounded-2xl p-4 flex items-center gap-4 text-white pointer-events-auto"
            >
               <div className="w-10 h-10 rounded-full bg-quest-accent/20 flex items-center justify-center text-quest-accent">
                 {IconMap[toast.icon]}
               </div>
               <div>
                 <p className="text-[10px] uppercase font-bold tracking-widest text-quest-accent">Achievement Unlocked!</p>
                 <p className="font-semibold">{toast.title}</p>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar - Profile & HUD */}
        <aside className="w-full md:w-80 flex flex-col gap-6">
          <div className="flex justify-end gap-2 items-center">
            {user ? (
              <div className="flex items-center gap-3">
                {syncing && <Cloud size={14} className="text-quest-accent animate-pulse" aria-label="Syncing data" />}
                <span className="text-xs text-white/50">{user.email}</span>
                <button aria-label="Log Out" onClick={logout} className="text-xs text-white/50 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full outline outline-1 outline-white/10 hover:outline-white/30 transition-all">
                  <LogOut size={12} /> Log Out
                </button>
              </div>
            ) : (
              <button aria-label="Log In with Google" onClick={login} className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-quest-accent/20 px-3 py-1.5 rounded-full outline outline-1 outline-quest-accent/50 hover:bg-quest-accent hover:text-black transition-all">
                <LogIn size={12} /> Sync Progress
              </button>
            )}
          </div>
          {/* Profile Card */}
          <div className="bg-quest-card backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-quest-accent/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <h1 className="text-2xl font-display font-bold tracking-tight text-white mb-6">Quest Log</h1>
          
          <div className="flex items-end gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-quest-bg border-2 border-quest-accent flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <span className="font-display text-2xl font-bold text-quest-accent">{stats.level}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-quest-muted uppercase tracking-wider font-semibold mb-1">Level {stats.level} Explorer</div>
              <div className="text-xs text-quest-muted flex justify-between mb-1">
                <span>XP</span>
                <span>{stats.xp} / {stats.xpToNextLevel}</span>
              </div>
              <div className="h-2 w-full bg-quest-bg rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-quest-accent shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.xp / stats.xpToNextLevel) * 100}%` }}
                />
              </div>
            </div>
          </div>

            <div className="text-sm text-quest-muted flex flex-col gap-2 border-t border-white/10 pt-4">
              <div className="flex justify-between">
                <span>Quests Completed:</span>
                <span className="text-white font-mono">{stats.questsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Streak:</span>
                <span className="text-orange-400 font-mono font-bold animate-pulse">{stats.streak} 🔥</span>
              </div>
            </div>
          </div>

          <PlantTracker 
            stats={stats}
          />

          <div className="flex justify-center -mt-2">
            <button
               onClick={() => setShowPlantSettings(prev => !prev)}
               className="text-[10px] uppercase font-bold tracking-wider text-quest-muted hover:text-white px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1"
            >
               <Settings size={12} /> Customize Plant
            </button>
          </div>

          <AnimatePresence>
            {showPlantSettings && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-quest-bg rounded-2xl p-4 border border-white/5 space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted block mb-2">Plant Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['leafy', 'cactus', 'bonsai', 'flower'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setStats(s => ({ ...s, plantType: t }))}
                          className={`text-xs py-1.5 rounded-md border transition-all ${stats.plantType === t || (t === 'leafy' && !stats.plantType) ? 'border-quest-accent bg-quest-accent/20 text-quest-accent' : 'border-white/10 text-quest-muted hover:border-white/30'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted block mb-2">Base Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {['#22c55e', '#84cc16', '#14b8a6', '#0ea5e9', '#d946ef', '#f43f5e', '#fbbf24', '#ffffff'].map(c => (
                        <button
                          key={c}
                          onClick={() => setStats(s => ({ ...s, plantColor: c }))}
                          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${stats.plantColor === c || (c === '#22c55e' && !stats.plantColor) ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted block mb-2">Pot Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {['#451a03', '#78350f', '#1e293b', '#334155', '#475569', '#3f2c2c', '#d97706', '#0f172a'].map(c => (
                        <button
                          key={c}
                          onClick={() => setStats(s => ({ ...s, plantPotColor: c }))}
                          className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${stats.plantPotColor === c || (c === '#451a03' && !stats.plantPotColor) ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        {/* Environment / Soundscapes */}
        <div className="bg-quest-card backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
          <h3 className="text-xs uppercase tracking-widest text-quest-muted mb-4 font-semibold flex items-center gap-2">
            <Volume2 size={14} /> Environment
          </h3>
          <div className="grid grid-cols-3 gap-2 border border-white/10 p-1 rounded-2xl bg-quest-bg mb-4">
            {(['rain', 'fire', 'waves'] as const).map((type) => (
              <button
                key={type}
                aria-label={`Toggle ${type} soundscape`}
                onClick={() => toggleSoundscape(type)}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all outline-none focus:ring-2 focus:ring-quest-accent/50 ${soundscape === type ? 'bg-quest-card text-quest-accent shadow-md' : 'text-quest-muted hover:text-white hover:bg-white/5'}`}
              >
                {soundscape === type && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-quest-accent animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                )}
                <div className="text-[10px] uppercase font-bold tracking-wider">{type}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 px-2 mb-6">
            <Volume2 size={14} className="text-quest-muted" />
            <input 
              type="range" 
              aria-label="Soundscape volume"
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-quest-accent outline-none focus:ring-1 focus:ring-quest-accent/50 rounded-full"
            />
          </div>

          <h3 className="text-xs uppercase tracking-widest text-quest-muted mb-4 font-semibold flex items-center gap-2">
            <Focus size={14} /> Timer Theme
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {(['frosted', 'minimalist', 'neon', 'vintage', 'cyberpunk', 'fantasy', 'retro'] as const).map((t) => {
              const themeStyles = {
                frosted: {
                  bg: "bg-[#1E1B4B]/30 backdrop-blur-md border border-white/10",
                  text: "text-indigo-400 font-sans font-bold",
                  ring: "border-indigo-500/50"
                },
                minimalist: {
                  bg: "bg-black border border-white/10 rounded-none",
                  text: "text-white/80 font-sans font-light tracking-tighter",
                  ring: "border-white/20"
                },
                neon: {
                  bg: "bg-slate-950 border border-fuchsia-500/30",
                  text: "text-fuchsia-400 font-mono drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]",
                  ring: "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                },
                vintage: {
                  bg: "bg-amber-50 rounded-sm border-2 border-amber-900 border-b-4 border-r-4",
                  text: "text-amber-950 font-serif font-black",
                  ring: "border-emerald-800"
                },
                cyberpunk: {
                  bg: "bg-black rounded-sm border border-yellow-400 shadow-[2px_2px_0_0_rgba(250,204,21,0.5)]",
                  text: "text-yellow-400 font-mono font-black",
                  ring: "border-cyan-400"
                },
                fantasy: {
                  bg: "bg-indigo-950 rounded-[2rem] border-[3px] border-amber-400/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]",
                  text: "text-amber-200 font-serif font-bold",
                  ring: "border-emerald-300"
                },
                retro: {
                  bg: "bg-[#1e1e24] rounded-sm border-4 border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                  text: "text-white font-mono font-black",
                  ring: "border-green-400 border-2"
                }
              };
              
              const s = themeStyles[t];
              
              return (
              <button
                key={t}
                aria-label={`Select ${t} theme`}
                onClick={() => setTimerTheme(t)}
                className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-all outline-none focus:ring-2 focus:ring-quest-accent/50 ${timerTheme === t ? 'ring-2 ring-quest-accent ring-offset-2 ring-offset-quest-bg ' + s.bg : 'hover:-translate-y-1 opacity-60 hover:opacity-100 ' + s.bg}`}
              >
                {timerTheme === t && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-quest-accent animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                )}
                <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center transition-transform group-hover:scale-110 ${s.ring}`}>
                  <span className={`text-[10px] ${s.text}`}>25</span>
                </div>
                <div className={`text-[10px] uppercase tracking-wider ${s.text}`}>{t}</div>
              </button>
            )})}
          </div>

          {/* Custom Theme Palette configuration */}
          <div className="mt-6 border-t border-white/10 pt-6">
            <h4 className="text-[10px] uppercase tracking-widest text-quest-muted mb-3 font-semibold">Customize Palette ({timerTheme})</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase text-quest-muted mb-1">Primary/Accent</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                    value={stats.themePalettes?.[timerTheme]?.primary || '#4f46e5'}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      setStats(s => ({
                        ...s,
                        themePalettes: {
                          ...(s.themePalettes || {}),
                          [timerTheme]: {
                            ...(s.themePalettes?.[timerTheme] || { background: '#000000', text: '#ffffff' }),
                            primary: newColor
                          }
                        }
                      }));
                    }}
                  />
                  {stats.themePalettes?.[timerTheme] && (
                    <button 
                      onClick={() => setStats(s => {
                        const newPalettes = { ...s.themePalettes };
                        delete newPalettes[timerTheme];
                        return { ...s, themePalettes: newPalettes };
                      })}
                      className="text-[10px] px-2 bg-white/5 hover:bg-white/10 rounded flex-1 text-white border border-white/10"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-quest-muted mb-1">Background</label>
                <input
                  type="color"
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                  value={stats.themePalettes?.[timerTheme]?.background || '#1e1b4b'}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setStats(s => ({
                      ...s,
                      themePalettes: {
                        ...(s.themePalettes || {}),
                        [timerTheme]: {
                          ...(s.themePalettes?.[timerTheme] || { primary: '#4f46e5', text: '#ffffff' }),
                          background: newColor
                        }
                      }
                    }));
                  }}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-quest-muted mb-1">Text/Timer</label>
                <input
                  type="color"
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                  value={stats.themePalettes?.[timerTheme]?.text || '#ffffff'}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setStats(s => ({
                      ...s,
                      themePalettes: {
                        ...(s.themePalettes || {}),
                        [timerTheme]: {
                          ...(s.themePalettes?.[timerTheme] || { primary: '#4f46e5', background: '#1e1b4b' }),
                          text: newColor
                        }
                      }
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-quest-card backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
           <h3 className="text-xs uppercase tracking-widest text-quest-muted mb-4 font-semibold flex items-center gap-2">
            <Crown size={14} /> Achievements
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((ach) => (
              <motion.div 
                key={ach.id} 
                initial={false}
                animate={{ scale: ach.unlocked ? 1 : 0.95, opacity: ach.unlocked ? 1 : 0.6 }}
                tabIndex={0}
                aria-label={ach.title}
                className={`aspect-square rounded-xl flex items-center justify-center border outline-none focus:ring-2 focus:ring-quest-accent/50 transition-colors ${ach.unlocked ? 'border-quest-accent bg-quest-accent/10 text-quest-accent shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/5 bg-quest-bg text-quest-muted/30'} group relative overflow-hidden`}
              >
                <motion.div animate={{ scale: ach.unlocked ? [1, 1.3, 1] : 1, rotate: ach.unlocked ? [0, 10, -10, 0] : 0 }} transition={{ duration: 0.5 }}>
                  {IconMap[ach.icon]}
                </motion.div>
                
                <AnimatePresence initial={false}>
                  {ach.unlocked && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="absolute inset-0 bg-white rounded-xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-50">
                  <div className="font-bold flex items-center gap-1">{ach.title} {ach.unlocked && <Star size={10} className="text-quest-accent" />}</div>
                  <div className="text-quest-muted text-[10px]">{ach.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-8">
        
        {/* Active Timer Area */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          <div className="w-full xl:w-2/3 flex flex-col">
            <TimerHUD
              timeLeft={timeLeft}
              totalTime={totalTime}
              mode={mode}
              questTitle={activeQuest?.title || 'Select a Quest'}
              onStartPause={handleStartPause}
              onStop={stopQuestAndPenalize}
              theme={timerTheme}
              customPalette={stats.themePalettes?.[timerTheme]}
            />
            {activeQuest && (
               <div className="mt-8 bg-quest-card backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 h-[300px] flex flex-col">
                 <h3 className="text-quest-accent font-display font-bold text-lg mb-4 border-b border-white/10 pb-2">Quest Grimoire (Notes)</h3>
                 <textarea 
                   value={activeQuest.notes}
                   onChange={(e) => updateNotes(e.target.value)}
                   placeholder="Write your quest notes here..."
                   className="flex-1 bg-transparent border-none outline-none resize-none text-white leading-relaxed placeholder-white/20 custom-scrollbar"
                 />
               </div>
            )}
            {mode !== 'idle' && (
              <div className="mt-6 flex justify-center">
                <button 
                  aria-label="Enter focus mode"
                  onClick={() => setFocusMode(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-quest-card rounded-full text-sm font-semibold tracking-wider hover:bg-white/5 transition-all outline outline-1 outline-white/10 focus:ring-2 focus:ring-quest-accent/50 outline-none"
                >
                  <Focus size={16} /> ENTER FOCUS MODE
                </button>
              </div>
            )}
            
            {mode === 'idle' && (
              <div className="mt-6 p-6 rounded-3xl bg-quest-card backdrop-blur-md border border-white/10 flex gap-4 flex-wrap justify-center shadow-xl">
                 <div className="w-full text-center mb-2 text-xs uppercase tracking-widest text-quest-muted font-bold">Quick Timers</div>
                 {presets.map(p => (
                   <div key={p.id}>
                     <Tooltip content={p.isBreak ? 'Starts a resting break' : 'Starts a focus session'}>
                       <button aria-label={`Start ${p.name} timer`} onClick={() => startBreak(p.durationMinutes)} className={`px-6 py-2 rounded-full border text-sm font-mono transition-colors ${p.isBreak ? 'border-quest-success/30 text-quest-success hover:bg-quest-success/10' : 'border-quest-accent/30 text-quest-accent hover:bg-quest-accent/10'}`}>
                         {p.name} <span className="opacity-70">({p.durationMinutes}m)</span>
                       </button>
                     </Tooltip>
                   </div>
                 ))}
                 <Tooltip content="Add new preset">
                   <button aria-label="Add new timer preset" onClick={() => {
                     const name = prompt('Preset Name:');
                     const mins = parseInt(prompt('Duration in minutes:') || '0');
                     if (name && mins > 0) {
                        setPresets([...presets, { id: Date.now().toString(), name, durationMinutes: mins, isBreak: true }]);
                     }
                   }} className="px-6 py-2 rounded-full border border-white/10 text-white/50 hover:bg-white/10 focus:ring-2 focus:ring-quest-accent/50 outline-none">
                     <Plus size={16} />
                   </button>
                 </Tooltip>
              </div>
            )}
          </div>

           <div className="w-full xl:w-1/3 flex flex-col">
             <AnimatePresence>
              {showQuote && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl relative mb-8"
                >
                  <svg className="absolute text-white/5 w-16 h-16 top-2 left-2" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2h4V8h-4zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2h4V8h-4z" />
                  </svg>
                  <p className="font-display text-xl text-center italic relative z-10 leading-relaxed text-quest-text/90">"{quote}"</p>
                </motion.div>
              )}
             </AnimatePresence>
           </div>
        </div>

        {/* Quest Board */}
        <div className="flex-1 bg-quest-card backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
             <h2 className="text-xl font-display font-bold tracking-tight flex items-center gap-2">
                <Sword className="text-quest-danger" size={24} /> Available Quests
             </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {sortedQuests.map((quest) => (
                <motion.div 
                  key={quest.id} 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  layout
                  className={`group flex flex-col p-4 rounded-2xl border transition-all ${quest.completed ? 'bg-quest-bg/50 border-quest-success/30 opacity-80' : activeQuest?.id === quest.id ? 'bg-quest-accent/10 border-quest-accent shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-quest-bg border-white/5 hover:border-white/20 hover:shadow-lg'}`}
                >
                  <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <Tooltip content={quest.completed ? 'Completed' : (mode !== 'idle' ? 'Timer Active' : 'Mark as Done')}>
                        <button 
                          aria-label={quest.completed ? `Quest ${quest.title} completed` : `Complete quest ${quest.title}`}
                          onClick={() => !quest.completed && completeQuest(quest.id)}
                          disabled={quest.completed || mode !== 'idle'}
                          className="text-quest-muted hover:text-quest-success transition-colors disabled:opacity-50"
                        >
                          <motion.div
                            initial={false}
                            animate={{ scale: quest.completed ? [1, 1.4, 1] : 1, rotate: quest.completed ? [0, -15, 0] : 0 }}
                            transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
                          >
                            {quest.completed ? <CheckCircle size={24} className="text-quest-success" /> : <Circle size={24} />}
                          </motion.div>
                        </button>
                      </Tooltip>
                      <div>
                        <h4 className={`font-semibold ${quest.completed ? 'line-through text-quest-muted' : 'text-white'}`}>{quest.title}</h4>
                        <div className="text-xs font-mono text-quest-muted mt-1 flex items-center gap-2">
                          <span>⌚ {quest.durationMinutes}m</span>
                          <span>•</span>
                          <span>✦ {quest.xpReward} XP</span>
                          {quest.priority && (
                            <>
                              <span>•</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${
                                quest.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                quest.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                                'bg-white/10 text-white/50'
                              }`}>
                                {quest.priority}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-2">
                     <Tooltip content={expandedQuestId === quest.id ? 'Hide Notes' : 'View Notes'}>
                       <button aria-expanded={expandedQuestId === quest.id} aria-label="Toggle quest notes" onClick={() => setExpandedQuestId(expandedQuestId === quest.id ? null : quest.id)} className="text-quest-muted hover:text-white p-2">
                         {expandedQuestId === quest.id ? <ChevronUp size={16} /> : <FileText size={16} />}
                       </button>
                     </Tooltip>
                     {!quest.completed && activeQuest?.id !== quest.id && (
                       <Tooltip content="Start this quest timer">
                         <button 
                          aria-label={`Start quest timer for ${quest.title}`}
                          onClick={() => startQuest(quest)}
                          className="flex items-center gap-2 px-4 py-2 bg-quest-accent text-black rounded-full font-bold uppercase tracking-wider text-xs opacity-0 group-hover:opacity-100 transition-all hover:scale-105 focus:opacity-100"
                         >
                           Embark <ArrowRight size={14} />
                         </button>
                       </Tooltip>
                     )}
                     {activeQuest?.id === quest.id && (
                        <span className="text-xs uppercase font-bold tracking-widest text-quest-accent animate-pulse">In Progress</span>
                     )}
                   </div>
                 </div>

                 {/* expanding notes area */}
                 <AnimatePresence>
                   {expandedQuestId === quest.id && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 pt-4 border-t border-white/10">
                       <textarea 
                         value={quest.notes}
                         onChange={(e) => {
                           const updatedQuests = quests.map(q => q.id === quest.id ? { ...q, notes: e.target.value } : q);
                           setQuests(updatedQuests);
                           if (activeQuest?.id === quest.id) {
                             setActiveQuest({ ...activeQuest, notes: e.target.value });
                           }
                         }}
                         placeholder="Add detailed quest notes..."
                         className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none h-24 focus:outline-none focus:border-quest-accent"
                       />
                     </motion.div>
                   )}
                 </AnimatePresence>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>

          {/* Add Quest Form */}
          <form onSubmit={addQuest} className="mt-6 flex gap-3">
             <input 
               type="text" 
               aria-label="New quest title"
               placeholder="New Quest Name..."
               value={newQuestTitle}
               onChange={(e) => setNewQuestTitle(e.target.value)}
               disabled={mode !== 'idle'}
               className="flex-1 bg-quest-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-quest-muted focus:outline-none focus:border-quest-accent focus:ring-1 focus:ring-quest-accent/50 disabled:opacity-50"
             />
             <Tooltip content="Quest Duration (mins)">
               <input 
                 type="number" 
                 aria-label="Quest duration in minutes"
                 min="1"
                 max="120"
                 placeholder="Min"
                 value={newQuestDuration}
                 onChange={(e) => setNewQuestDuration(e.target.value)}
                 disabled={mode !== 'idle'}
                 className="w-24 bg-quest-bg border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-white placeholder-quest-muted focus:outline-none focus:border-quest-accent focus:ring-1 focus:ring-quest-accent/50 disabled:opacity-50"
               />
             </Tooltip>
             <Tooltip content="Priority">
               <select
                 value={newQuestPriority}
                 onChange={(e) => setNewQuestPriority(e.target.value as 'low' | 'medium' | 'high')}
                 disabled={mode !== 'idle'}
                 className="w-24 bg-quest-bg border border-white/10 rounded-xl px-2 py-3 text-center font-sans text-white text-sm focus:outline-none focus:border-quest-accent focus:ring-1 focus:ring-quest-accent/50 disabled:opacity-50"
               >
                 <option value="low">Low</option>
                 <option value="medium">Med</option>
                 <option value="high">High</option>
               </select>
             </Tooltip>
             <Tooltip content={mode !== 'idle' ? 'Timer Active' : 'Add Quest'}>
               <button 
                 type="submit"
                 aria-label="Add new quest"
                 disabled={!newQuestTitle.trim() || mode !== 'idle'}
                 className="w-12 flex items-center justify-center bg-quest-card border border-white/10 hover:border-quest-accent text-quest-accent rounded-xl disabled:opacity-50 disabled:hover:border-white/10 transition-colors focus:ring-2 focus:ring-quest-accent/50 outline-none"
               >
                 <Plus size={24} />
               </button>
             </Tooltip>
          </form>

        </div>
      </main>
      </div>
    </div>
  );
}

