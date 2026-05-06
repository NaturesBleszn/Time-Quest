import React, { useEffect, useState, useRef } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Quest, Achievement, UserStats, TimerPreset } from '../types';

export function useSync(
  stats: UserStats, 
  setStats: React.Dispatch<React.SetStateAction<UserStats>>,
  quests: Quest[],
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>,
  achievements: Achievement[],
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>,
  presets: TimerPreset[],
  setPresets: React.Dispatch<React.SetStateAction<TimerPreset[]>>,
  blockedSites: string[],
  setBlockedSites: React.Dispatch<React.SetStateAction<string[]>>
) {
  const [user, setUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncing(true);
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.stats) setStats(data.stats);
            if (data.quests) setQuests(data.quests);
            if (data.achievements) setAchievements(data.achievements);
            if (data.presets) setPresets(data.presets);
            if (data.blockedSites) setBlockedSites(data.blockedSites);
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }
        setSyncing(false);
        initialized.current = true;
      } else {
        initialized.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync changes up
  useEffect(() => {
    if (!user || !initialized.current || syncing) return;

    const syncTimeout = setTimeout(() => {
      const docRef = doc(db, 'users', user.uid);
      setDoc(docRef, {
        userId: user.uid,
        stats,
        quests,
        achievements,
        presets,
        blockedSites,
        updatedAt: Date.now()
      }).catch(e => console.error("Error syncing to Firebase", e));
    }, 2000); // 2 second debounce

    return () => clearTimeout(syncTimeout);
  }, [user, stats, quests, achievements, presets, blockedSites, syncing]);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(e => console.error("Login failed", e));
  };

  const logout = () => {
    signOut(auth);
  };

  return { user, login, logout, syncing };
}
