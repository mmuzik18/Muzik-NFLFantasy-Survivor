// The NFL season is named after the year it kicks off (a Sept 2026 - Feb
// 2027 season is "the 2026 season"), so Jan/Feb games still belong to the
// previous calendar year's season.
export function currentNflSeason(now: Date = new Date()): number {
  return now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1;
}

// Rough estimate only, used as a default when no week is specified. The
// regular season kicks off the first Thursday after Labor Day (the first
// Monday in September); this is close enough to be a convenient default,
// not a source of truth for locking/grading, which always use real
// kickoff times from ESPN once a week's schedule is loaded.
export function currentNflWeekGuess(now: Date = new Date()): number {
  const season = currentNflSeason(now);
  const laborDay = new Date(season, 8, 1);
  while (laborDay.getDay() !== 1) laborDay.setDate(laborDay.getDate() + 1);
  const kickoff = new Date(laborDay);
  kickoff.setDate(kickoff.getDate() + 3);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const week = Math.floor((now.getTime() - kickoff.getTime()) / msPerWeek) + 1;
  return Math.min(Math.max(week, 1), 18);
}
