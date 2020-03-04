import { MILLISECONDS_IN_DAY } from './constants';
import { Team, WorkLog } from './model';

export function hasExistingPair(pair: Team, workLog1: WorkLog, workLog2: WorkLog): boolean {
  return (
    (pair.firstEmployeeId === workLog1.employeeId && pair.secondEmployeeId === workLog2.employeeId) ||
    (pair.firstEmployeeId === workLog2.employeeId && pair.secondEmployeeId === workLog1.employeeId)
  );
}

export function isTheSamePair(pair1: Team, pair2: Team): boolean {
  return (
    (pair1.firstEmployeeId === pair2.firstEmployeeId && pair1.secondEmployeeId === pair2.secondEmployeeId) ||
    (pair1.firstEmployeeId === pair2.secondEmployeeId && pair1.secondEmployeeId === pair2.firstEmployeeId)
  );
}

export function checkOverlap(firstLog: WorkLog, secondLog: WorkLog): boolean {
  return (firstLog.dateFrom <= secondLog.dateTo) && (firstLog.dateTo >= secondLog.dateFrom);
}

export function calculateOverlappingDays(firstLog: WorkLog, secondLog: WorkLog): number {
  const startTime = firstLog.dateFrom < secondLog.dateFrom ? secondLog.dateFrom : firstLog.dateFrom;
  const endTime = firstLog.dateTo < secondLog.dateTo ? firstLog.dateTo : secondLog.dateTo;
  return Math.round(Math.abs((startTime - endTime) / MILLISECONDS_IN_DAY));
}

export function normalizeDateForSafari(dateString: string): string {
  // Safari can't parse dates with 'T' separator for date and time.
  // It can't parse date formats with time zone either
  const plusIndex = dateString.indexOf('+');
  const minusIndex = dateString.indexOf('-');
  const hasTimezone = plusIndex !== -1 || minusIndex !== -1;
  return dateString.replace(' ', 'T').substring(0, !hasTimezone ? 19 : (plusIndex !== -1 ? plusIndex : minusIndex));
}

export function isSafarBrowser(): boolean {
  const isChrome = window.navigator.userAgent.includes('Chrome');
  const isChromium = window.navigator.userAgent.includes('Chromium');
  const isSafari = window.navigator.userAgent.includes('Safari');
  return isSafari && !isChrome && !isChromium;
}
