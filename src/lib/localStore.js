// ═══════════════════════════════════════════════
// تخزين محلي (وضع الزائر — قبل تسجيل الدخول)
// ═══════════════════════════════════════════════

const PAIRS_KEY = 'dahabi_pairs_v1';
const SAVINGS_KEY = 'dahabi_savings_v1';
const ALERTS_KEY = 'dahabi_alerts_v1';
export const SESSION_KEY = 'dahabi_session_v1';

export function loadLocalPairs() {
  try { return JSON.parse(localStorage.getItem(PAIRS_KEY)) || []; } catch (_) { return []; }
}
export function saveLocalPairs(list) {
  localStorage.setItem(PAIRS_KEY, JSON.stringify(list));
}

export function loadLocalSavings() {
  try { return JSON.parse(localStorage.getItem(SAVINGS_KEY)) || []; } catch (_) { return []; }
}
export function saveLocalSavings(list) {
  localStorage.setItem(SAVINGS_KEY, JSON.stringify(list));
}

export function loadLocalAlerts() {
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY)) || []; } catch (_) { return []; }
}
export function saveLocalAlerts(list) {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(list));
}

export function clearLocalData() {
  localStorage.removeItem(PAIRS_KEY);
  localStorage.removeItem(SAVINGS_KEY);
  localStorage.removeItem(ALERTS_KEY);
}

export function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (_) { return null; }
}
export function storeSession(s) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
