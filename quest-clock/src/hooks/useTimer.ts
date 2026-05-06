import { useState, useEffect, useRef } from 'react';
import { audio } from '../lib/audio';

export type TimerMode = 'idle' | 'running' | 'paused' | 'break';

export interface TimerOptions {
  onComplete: () => void;
  customSound?: () => void;
  notificationMessage?: string;
}

export function useTimer(optionsOrOnComplete: (() => void) | TimerOptions) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [mode, setMode] = useState<TimerMode>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const optionsRef = useRef<{onComplete: () => void, customSound?: () => void, notificationMessage?: string}>({
    onComplete: () => {}
  });

  useEffect(() => {
    let onComplete: () => void;
    let customSound: (() => void) | undefined;
    let notificationMessage: string | undefined;

    if (typeof optionsOrOnComplete === 'function') {
      onComplete = optionsOrOnComplete;
    } else {
      onComplete = optionsOrOnComplete.onComplete;
      customSound = optionsOrOnComplete.customSound;
      notificationMessage = optionsOrOnComplete.notificationMessage;
    }
    
    optionsRef.current = { onComplete, customSound, notificationMessage };
  }, [optionsOrOnComplete]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (mode === 'running' || mode === 'break') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const { customSound, notificationMessage, onComplete } = optionsRef.current;
            
            if (customSound) {
              customSound();
            } else {
              audio.playBell();
            }

            if (notificationMessage && "Notification" in window && Notification.permission === "granted") {
              new Notification(notificationMessage);
            }

            clearInterval(timerRef.current!);
            
            // Wait a tick before firing complete to allow UI to render 0
            setTimeout(() => {
                if (mode === 'running') {
                    onComplete();
                } else {
                    setMode('idle');
                }
            }, 100);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode]);

  const start = (seconds: number, isBreak = false) => {
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setMode(isBreak ? 'break' : 'running');
  };

  const pause = () => setMode('paused');
  
  const resume = () => setMode(timeLeft > 0 ? 'running' : 'idle');
  
  const stop = () => {
    setMode('idle');
    setTimeLeft(0);
  };

  const currentProgress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return { timeLeft, totalTime, mode, start, pause, resume, stop, currentProgress };
}
