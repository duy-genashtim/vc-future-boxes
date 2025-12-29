/**
 * formatDate.ts
 * Date formatting utilities for unlock time display
 */

import { format, addDays, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

/**
 * Format unlock date for display
 * Example: "Dec 25, 2026 at 9:00 AM"
 */
export function formatUnlockDate(date: Date): string {
  return format(date, "MMM dd, yyyy 'at' h:mm a");
}

/**
 * Format unlock date - short version
 * Example: "Dec 25, 2026"
 */
export function formatUnlockDateShort(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

/**
 * Calculate date from preset (e.g., "1 Week" = +7 days)
 */
export function getDateFromPreset(days: number): Date {
  return addDays(new Date(), days);
}

/**
 * Get countdown preview text
 * Example: "In 1 year, 2 days"
 */
export function getCountdownPreview(targetDate: Date): string {
  const now = new Date();
  const days = differenceInDays(targetDate, now);

  if (days === 0) {
    const hours = differenceInHours(targetDate, now);
    if (hours === 0) {
      const minutes = differenceInMinutes(targetDate, now);
      return `In ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `In ${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  if (days < 30) {
    return `In ${days} day${days !== 1 ? 's' : ''}`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `In ${months} month${months !== 1 ? 's' : ''}`;
    }
    return `In ${months} month${months !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  }

  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  if (remainingDays === 0) {
    return `In ${years} year${years !== 1 ? 's' : ''}`;
  }
  return `In ${years} year${years !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
}

/**
 * Validate if date is in the future (at least 45 minutes from now)
 */
export function isFutureDate(date: Date): boolean {
  const now = Date.now();
  const selectedTime = date.getTime();
  const minValidTime = now + (45 * 60 * 1000); // 45 minutes in milliseconds
  return selectedTime >= minValidTime;
}

/**
 * Format creation date for display
 * Example: "Created on Nov 25, 2024"
 */
export function formatCreationDate(timestamp: number): string {
  return `Created on ${format(new Date(timestamp * 1000), 'MMM dd, yyyy')}`;
}

/**
 * Format opened date for display
 * Example: "Opened on Dec 25, 2024"
 */
export function formatOpenedDate(timestamp: number): string {
  return `Opened on ${format(new Date(timestamp * 1000), 'MMM dd, yyyy')}`;
}
