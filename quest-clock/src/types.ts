export interface Quest {
  id: string;
  title: string;
  durationMinutes: number; // For pomodoro or custom
  completed: boolean;
  xpReward: number;
  notes: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface CustomColorPalette {
  primary: string;
  background: string;
  text: string;
}

export interface UserStats {
  level: number;
  xp: number;
  totalXpEarned: number;
  xpToNextLevel: number;
  questsCompleted: number;
  streak: number;
  highestStreak: number;
  plantHealth: number; // 0 to 100
  plantStage: number; // 0 to 3
  plantType?: 'leafy' | 'cactus' | 'bonsai' | 'flower';
  plantColor?: string;
  plantPotColor?: string;
  hasUsedRain?: boolean;
  hasUsedFire?: boolean;
  hasUsedWaves?: boolean;
  hasFinishedLongQuest?: boolean;
  hasFinishedShortQuest?: boolean;
  hasTakenBreak?: boolean;
  themePalettes?: Record<string, CustomColorPalette>;
  highPriorityCompleted?: number;
}

export interface TimerPreset {
  id: string;
  name: string;
  durationMinutes: number;
  isBreak: boolean;
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_quest', title: 'First Quest', description: 'Complete your first quest.', unlocked: false, icon: 'Sword' },
  { id: 'focus_novice', title: 'Focus Novice', description: 'Complete 3 quests.', unlocked: false, icon: 'Shield' },
  { id: 'focus_master', title: 'Focus Master', description: 'Complete 10 quests.', unlocked: false, icon: 'Crown' },
  { id: 'break_time', title: 'Resting Warrior', description: 'Take your first break.', unlocked: false, icon: 'Coffee' },
  { id: 'streak_3', title: 'On Fire', description: 'Reach a 3-quest streak.', unlocked: false, icon: 'Flame' },
  { id: 'streak_5', title: 'Unstoppable', description: 'Reach a 5-quest streak.', unlocked: false, icon: 'Zap' },
  { id: 'streak_10', title: 'Marathon Runner', description: 'Record a highest streak of 10 quests.', unlocked: false, icon: 'Trophy' },
  { id: 'streak_20', title: 'Legendary Focus', description: 'Record a highest streak of 20 quests.', unlocked: false, icon: 'Crown' },
  { id: 'xp_100', title: 'Apprentice Gatherer', description: 'Earn a total of 100 XP.', unlocked: false, icon: 'Star' },
  { id: 'xp_500', title: 'Adept Hoarder', description: 'Earn a total of 500 XP.', unlocked: false, icon: 'Gem' },
  { id: 'soundscape_rain', title: 'Pluviophile', description: 'Focus with the rain soundscape.', unlocked: false, icon: 'CloudRain' },
  { id: 'soundscape_fire', title: 'Cozy Camper', description: 'Focus with the fire soundscape.', unlocked: false, icon: 'Flame' },
  { id: 'soundscape_waves', title: 'Ocean Whisperer', description: 'Focus with the waves soundscape.', unlocked: false, icon: 'Droplets' },
  { id: 'soundscape_master', title: 'Sensory Master', description: 'Explore all soundscapes.', unlocked: false, icon: 'Volume2' },
  { id: 'long_quest', title: 'Deep Dive', description: 'Complete a quest lasting 60+ minutes.', unlocked: false, icon: 'Hourglass' },
  { id: 'short_quest', title: 'Quick Sprint', description: 'Complete a quest under 10 minutes.', unlocked: false, icon: 'Timer' },
  { id: 'high_priority_3', title: 'Critical Thinker', description: 'Complete 3 high-priority quests.', unlocked: false, icon: 'Zap' },
];
