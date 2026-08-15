"use client";

export type SessionUser = {
  id: string;
  email: string;
  display_name: string;
};

export type SessionState = {
  accessToken: string;
  user: SessionUser;
};

const SESSION_KEY = "erbnd.session";
const SESSION_EVENT = "erbnd-session-change";

export function getSession(): SessionState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setSession(session: SessionState): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function onSessionChange(handler: () => void): () => void {
  const sync = () => handler();
  window.addEventListener("storage", sync);
  window.addEventListener(SESSION_EVENT, sync);
  return () => {
    window.removeEventListener("storage", sync);
    window.removeEventListener(SESSION_EVENT, sync);
  };
}
