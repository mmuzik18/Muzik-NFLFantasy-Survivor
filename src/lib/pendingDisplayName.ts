// A name typed into the sign-up form's display-name field is captured
// here (plain localStorage, not a Cognito attribute — see
// providers.tsx/PlayerContext.tsx for why) and consumed once, the first
// time PlayerContext creates this account's Player record.
const KEY = "muzik-survivor:pending-display-name";

export function savePendingDisplayName(name: string) {
  try {
    if (name.trim()) localStorage.setItem(KEY, name);
    else localStorage.removeItem(KEY);
  } catch {
    // Private browsing / blocked storage — non-fatal, the WelcomeNamePrompt
    // banner still catches this case right after sign-up either way.
  }
}

export function loadPendingDisplayName(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function consumePendingDisplayName(): string {
  const name = loadPendingDisplayName();
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return name;
}
