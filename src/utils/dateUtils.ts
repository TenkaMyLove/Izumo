import { AgendaItem, ItemStatus } from '../types';

/**
 * Gets today's date in YYYY-MM-DD string format (using local timezone or simulated override)
 */
export function getTodayDateString(simulatedDateOverride?: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const realTodayStr = `${year}-${month}-${day}`;

  if (simulatedDateOverride && simulatedDateOverride > realTodayStr) {
    return simulatedDateOverride;
  }
  return realTodayStr;
}

/**
 * Computes the status of an item based on today's date
 */
export function getItemStatus(item: AgendaItem, todayStr: string): ItemStatus {
  if (!item || typeof item !== 'object') {
    return 'Upcoming';
  }
  if (item.isDone) {
    return 'Done';
  }
  if (item.dueDate < todayStr) {
    return 'Overdue';
  }
  if (item.dueDate === todayStr) {
    return 'Due Today';
  }
  return 'Upcoming';
}

/**
 * Checks if a done item should be cleared due to day rollover (PRD 4.5)
 * Done items are visible on the day they are completed.
 * On subsequent days (doneAt date < today), they get cleared.
 */
export function isDoneItemExpired(item: AgendaItem, todayStr: string): boolean {
  if (!item.isDone) return false;
  
  if (item.doneAt) {
    const doneDate = item.doneAt.split('T')[0];
    return doneDate < todayStr;
  }
  
  // Fallback if doneAt was not set (e.g., legacy items): check updatedAt or assume done before today if dueDate < todayStr
  return false;
}

/**
 * Format date for human display (e.g., "Today", "Tomorrow", "Yesterday", "Oct 24")
 */
export function formatFriendlyDate(dateStr: string, todayStr: string): string {
  if (!dateStr) return '';
  
  if (dateStr === todayStr) {
    return 'Today';
  }

  const [tY, tM, tD] = todayStr.split('-').map(Number);
  const [dY, dM, dD] = dateStr.split('-').map(Number);

  const todayObj = new Date(tY, tM - 1, tD);
  const dateObj = new Date(dY, dM - 1, dD);

  const diffMs = dateObj.getTime() - todayObj.getTime();
  const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;

  // Format as short month & day
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (dY !== tY) {
    options.year = 'numeric';
  }
  return dateObj.toLocaleDateString('en-US', options);
}
