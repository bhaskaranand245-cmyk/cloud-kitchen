/**
 * Helper to check if the kitchen is currently closed based on standard or overnight curfews.
 */
export function checkIsKitchenClosed(opening: string = "08:00", closing: string = "22:00"): boolean {
  try {
    const now = new Date();
    const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (closing > opening) {
      // Overnight curfew, e.g., closed from 22:00 to 08:00
      return currentStr >= closing || currentStr < opening;
    } else if (closing < opening) {
      // Same day curfew, e.g., closed from 14:00 to 16:00
      return currentStr >= closing && currentStr < opening;
    }
  } catch (e) {
    console.error("Failed calculating hours curfew state:", e);
  }
  return false;
}

/**
 * Calculates string representation of exact remaining hours and minutes until reopening.
 */
export function getRemainingHoursAndMinutes(opening: string = "08:00"): string {
  try {
    const now = new Date();
    const [opHStr, opMStr] = opening.split(':');
    const opH = parseInt(opHStr, 10);
    const opM = parseInt(opMStr, 10);

    const targetDate = new Date();
    targetDate.setHours(opH, opM, 0, 0);

    // If target date is in the past (e.g. today's 8am is done, but now is 11pm), target is tomorrow's 8am
    if (targetDate.getTime() <= now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const diffMs = targetDate.getTime() - now.getTime();
    const diffMinsTotal = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinsTotal / 60);
    const minutes = diffMinsTotal % 60;

    let res = '';
    if (hours > 0) res += `${hours} hr${hours > 1 ? 's' : ''} `;
    if (minutes > 0 || hours === 0) res += `${minutes} min${minutes > 1 ? 's' : ''}`;
    return res.trim() || 'a few moments';
  } catch (e) {
    return 'a short while';
  }
}

/**
 * Format 24-hour time to standard 12-hour AM/PM format
 */
export function formatTime12h(time24: string): string {
  try {
    if (!time24 || !time24.includes(':')) return time24;
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${h}:${mStr} ${ampm}`;
  } catch (e) {
    return time24;
  }
}
