/**
 * formatCountdown.ts
 * Helper function to format countdown timer display
 * Based on PRD F6: Capsule Timer requirements
 */

/**
 * Format countdown remaining into human-readable countdown string
 *
 * Rules (from PRD F6 & Activity Diagram):
 * - > 1 day: "Xd Yh Zm" (e.g., "3d 5h 30m")
 * - < 1 day: "H:MM:SS" (e.g., "5:30:45") - digital clock format with seconds ticking
 * - <= 0: "Ready!" (should not happen, but fallback)
 *
 * @param unlockAt - Unix timestamp when capsule unlocks (seconds, not milliseconds!)
 * @param now - Current timestamp (seconds), defaults to current Unix time
 * @returns Formatted countdown string
 */
export function formatCountdown(unlockAt: number, now: number = Math.floor(Date.now() / 1000)): string {
  const secondsRemaining = unlockAt - now;

  // Already unlocked or past due
  if (secondsRemaining <= 0) {
    return 'Ready!';
  }

  const totalMinutes = Math.floor(secondsRemaining / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  // More than 1 day: "Xd Yh Zm" format
  if (days > 0) {
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    return `${days}d ${hours}h ${minutes}m`;
  }

  // Less than 1 day: "H:MM:SS" digital clock format
  const hours = totalHours;
  const minutes = totalMinutes % 60;
  const seconds = secondsRemaining % 60;

  // Pad minutes and seconds with leading zero
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${hours}:${mm}:${ss}`;
}

/**
 * Determine if countdown should update every second (< 24 hours remaining)
 * Used to optimize timer refresh interval
 *
 * @param unlockAt - Unix timestamp when capsule unlocks (seconds)
 * @param now - Current timestamp (seconds), defaults to current Unix time
 * @returns true if countdown is < 24 hours (needs second-level updates)
 */
export function shouldUpdateEverySecond(unlockAt: number, now: number = Math.floor(Date.now() / 1000)): boolean {
  const secondsRemaining = unlockAt - now;
  const hoursRemaining = secondsRemaining / 3600;
  return hoursRemaining < 24 && hoursRemaining > 0;
}

/**
 * Get appropriate update interval for countdown timer
 *
 * @param unlockAt - Unix timestamp when capsule unlocks (seconds)
 * @param now - Current timestamp (seconds), defaults to current Unix time
 * @returns Interval in milliseconds (1000ms for < 24h, 60000ms for >= 24h)
 */
export function getCountdownInterval(unlockAt: number, now: number = Math.floor(Date.now() / 1000)): number {
  return shouldUpdateEverySecond(unlockAt, now) ? 1000 : 60000;
}
