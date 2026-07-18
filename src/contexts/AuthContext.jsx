import { createContext, useContext, useState, useEffect } from 'react';
import {
  authSignIn, authSignUp, authSignOut, authGetUser, authRefresh, fetchProfile, updateProfile,
  SUPABASE_URL, ANON_KEY,
} from '../lib/supabase';
import { loadSession, storeSession, clearSession } from '../lib/localStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);

  // استعادة الجلسة عند فتح الموقع (أو استقبال عودة تسجيل الدخول بجوجل)
  useEffect(() => {
    (async () => {
      // 1) رجوع من تسجيل الدخول بجوجل: الرمز يوصل بجزء الرابط (#access_token=...)
      if (window.location.hash.includes('access_token')) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token) {
          try {
            const user = await authGetUser(access_token);
            const s = { access_token, refresh_token, user };
            storeSession(s);
            setSession(s);
            window.history.replaceState(null, '', window.location.pathname);
            setRestoring(false);
            return;
          } catch (_) { /* نكمل لمحاولة الاستعادة العادية */ }
        }
      }
      // 2) استعادة الجلسة المحفوظة من زيارة سابقة
      const s = loadSession();
      if (!s) { setRestoring(false); return; }
      try {
        await authGetUser(s.access_token);
        setSession(s);
      } catch (_) {
        try {
          const data = await authRefresh(s.refresh_token);
          const fresh = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
          storeSession(fresh);
          setSession(fresh);
        } catch (_e) {
          clearSession();
        }
      }
      setRestoring(false);
    })();
  }, []);

  async function signIn(email, password) {
    const data = await authSignIn(email, password);
    const s = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
    storeSession(s);
    setSession(s);
    return s;
  }

  async function signUp(email, password) {
    const data = await authSignUp(email, password);
    if (data.access_token) {
      const s = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
      storeSession(s);
      setSession(s);
      return s;
    }
    throw new Error('CHECK_EMAIL');
  }

  async function signOut() {
    if (session) await authSignOut(session.access_token);
    clearSession();
    setSession(null);
  }

  // يوجّه المستخدم لصفحة تسجيل الدخول بجوجل (نفس مزوّد المصادقة بالتطبيق)
  function signInWithGoogle() {
    const redirectTo = window.location.origin + '/'; // جذر الموقع دائماً — أسهل مطابقة
    window.location.href =
      `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}&apikey=${ANON_KEY}`;
  }

  // يجيب اللغة/العملة المحفوظة بحساب المستخدم
  async function loadRemoteProfile() {
    if (!session) return null;
    try { return await fetchProfile(session); } catch (_) { return null; }
  }

  // يحدّث اللغة/العملة بحساب المستخدم
  async function syncProfile(language, currency) {
    if (!session) return;
    await updateProfile(session, { language, currency });
  }

  return (
    <AuthContext.Provider value={{ session, restoring, signIn, signUp, signOut, signInWithGoogle, loadRemoteProfile, syncProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
