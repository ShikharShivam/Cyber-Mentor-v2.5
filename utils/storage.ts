import { SavedSession } from '../types';

const STORAGE_KEY = 'cyber_mentor_session_v1';

export const saveSession = (session: SavedSession) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save session to local storage", e);
  }
};

export const loadSession = (): SavedSession | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as SavedSession;
  } catch (e) {
    console.error("Failed to load session", e);
    return null;
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session", e);
  }
};
