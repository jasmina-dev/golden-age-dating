import { useState, useEffect } from 'react';

interface TimeUntil {
  hours: number;
  minutes: number;
  seconds: number;
}

interface TonightModeTimerState {
  isUnlocked: boolean;
  timeUntilUnlock: TimeUntil;
  formattedCountdown: string;
}

/**
 * The Golden Hour: Tonight Mode is only available between 7:00 PM and 9:00 PM local time.
 * This hook tracks whether the feature is unlocked and provides countdown until unlock.
 */
export function useTonightModeTimer(): TonightModeTimerState {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for accurate countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate if we're in the unlock window (7 PM - 9 PM)
  // TODO: For testing, always unlocked. Change back to time-based check for production
  const isUnlocked = true; // Always unlocked for testing
  // const hour = currentTime.getHours();
  // return hour >= 19 && hour < 21; // 7 PM (19:00) to 9 PM (21:00)

  // Calculate time until unlock
  const timeUntilUnlock = ((): TimeUntil => {
    if (isUnlocked) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const now = currentTime;
    const hour = now.getHours();
    let unlockTime = new Date(now);

    // Set unlock time to 7:00 PM
    unlockTime.setHours(19, 0, 0, 0);

    // If we're past 9 PM (21:00), unlock time is 7 PM tomorrow
    if (hour >= 21) {
      unlockTime.setDate(unlockTime.getDate() + 1);
    }
    // If we're before 7 PM (0:00-18:59), unlock time is 7 PM today (already set above)

    // Calculate difference
    const diff = unlockTime.getTime() - now.getTime();

    // Ensure non-negative values
    const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

    return { hours, minutes, seconds };
  })();

  // Format countdown string
  const formattedCountdown = ((): string => {
    if (isUnlocked) {
      return '';
    }

    const { hours, minutes } = timeUntilUnlock;
    
    if (hours > 0) {
      return `Unlocks in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `Unlocks in ${minutes}m`;
    } else {
      return 'Unlocks soon';
    }
  })();

  return {
    isUnlocked,
    timeUntilUnlock,
    formattedCountdown,
  };
}

