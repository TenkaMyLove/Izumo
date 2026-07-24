export type RecurrenceType = 'none' | 'weekly' | 'monthly';

/**
 * Increment episode or chapter number in a title string.
 * Examples:
 * - "Chained Soldier Episode 1" -> "Chained Soldier Episode 2"
 * - "Chained Soldier Ep. 12" -> "Chained Soldier Ep. 13"
 * - "Solo Leveling Chapter 180" -> "Solo Leveling Chapter 181"
 * - "Omniscient Reader Ch. 42" -> "Omniscient Reader Ch. 43"
 * - "S1E04" -> "S1E05"
 * - "Chained Soldier" -> "Chained Soldier Episode 2"
 */
export function incrementEpisodeTitle(title: string): string {
  if (!title) return title;

  // Pattern 1: Match "Episode 1", "Ep. 1", "Ep 1", "Chapter 180", "Ch. 42", "Ch 42", "Vol 3", "#12"
  const wordNumRegex = /(Episode|Ep\.|Ep|Chapter|Ch\.|Ch|Vol\.|Vol|#)\s*(\d+)/i;
  const matchWordNum = title.match(wordNumRegex);

  if (matchWordNum) {
    const prefix = matchWordNum[1];
    const currentNum = parseInt(matchWordNum[2], 10);
    const nextNum = currentNum + 1;
    // Keep zero padding if original had leading zeros (e.g. 04 -> 05)
    const padded = matchWordNum[2].length > 1 && matchWordNum[2].startsWith('0')
      ? String(nextNum).padStart(matchWordNum[2].length, '0')
      : String(nextNum);

    return title.replace(wordNumRegex, `${prefix} ${padded}`);
  }

  // Pattern 2: Match "S1E04" or "E04"
  const seRegex = /(S\d+E|E)(\d+)/i;
  const matchSE = title.match(seRegex);
  if (matchSE) {
    const prefix = matchSE[1];
    const currentNum = parseInt(matchSE[2], 10);
    const nextNum = currentNum + 1;
    const padded = matchSE[2].length > 1 && matchSE[2].startsWith('0')
      ? String(nextNum).padStart(matchSE[2].length, '0')
      : String(nextNum);

    return title.replace(seRegex, `${prefix}${padded}`);
  }

  // Pattern 3: Trailing number e.g. "Solo Leveling 180"
  const trailingNumRegex = /(\b\d+\b)(?=[^\d]*$)/;
  const matchTrailing = title.match(trailingNumRegex);
  if (matchTrailing) {
    const currentNum = parseInt(matchTrailing[1], 10);
    const nextNum = currentNum + 1;
    return title.replace(trailingNumRegex, String(nextNum));
  }

  // Fallback: If no number found, append " Ep. 2"
  return `${title} Ep. 2`;
}

/**
 * Calculates the next due date based on recurrence pattern
 */
export function calculateNextDueDate(currentDueDateStr: string, recurrence: RecurrenceType): string {
  if (!currentDueDateStr || recurrence === 'none') {
    return currentDueDateStr;
  }

  const [y, m, d] = currentDueDateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);

  if (recurrence === 'weekly') {
    dt.setDate(dt.getDate() + 7);
  } else if (recurrence === 'monthly') {
    dt.setMonth(dt.getMonth() + 1);
  }

  const nextY = dt.getFullYear();
  const nextM = String(dt.getMonth() + 1).padStart(2, '0');
  const nextD = String(dt.getDate()).padStart(2, '0');

  return `${nextY}-${nextM}-${nextD}`;
}
