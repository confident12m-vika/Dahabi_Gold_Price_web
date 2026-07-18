import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchFavorites, addFavorite, removeFavorite, toggleFavoriteFlag,
  fetchSavings, addSaving as addSavingRemote, removeSaving as removeSavingRemote,
  fetchAlerts, addAlert as addAlertRemote, removeAlert as removeAlertRemote, toggleAlert as toggleAlertRemote,
} from '../lib/supabase';
import {
  loadLocalPairs, saveLocalPairs, loadLocalSavings, saveLocalSavings,
  loadLocalAlerts, saveLocalAlerts, clearLocalData,
} from '../lib/localStore';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { session } = useAuth();
  const [pairs, setPairs] = useState([]);
  const [savings, setSavings] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const refreshPairs = useCallback(async () => {
    if (session) {
      try { setPairs(await fetchFavorites(session)); } catch (_) { setPairs([]); }
    } else {
      setPairs(loadLocalPairs());
    }
  }, [session]);

  const refreshSavings = useCallback(async () => {
    if (session) {
      try { setSavings(await fetchSavings(session)); } catch (_) { setSavings([]); }
    } else {
      setSavings(loadLocalSavings());
    }
  }, [session]);

  const refreshAlerts = useCallback(async () => {
    if (session) {
      try { setAlerts(await fetchAlerts(session)); } catch (_) { setAlerts([]); }
    } else {
      setAlerts(loadLocalAlerts());
    }
  }, [session]);

  // إعادة التحميل عند تسجيل الدخول/الخروج (تبديل بين المحلي والبعيد)
  useEffect(() => {
    refreshPairs();
    refreshSavings();
    refreshAlerts();
  }, [session, refreshPairs, refreshSavings, refreshAlerts]);

  async function addPair(item) {
    if (session) {
      await addFavorite(session, item);
    } else {
      const list = loadLocalPairs();
      list.push({ id: Date.now(), ...item });
      saveLocalPairs(list);
    }
    refreshPairs();
  }

  async function removePair(id) {
    if (session) {
      await removeFavorite(session, id);
    } else {
      saveLocalPairs(loadLocalPairs().filter((x) => x.id !== id));
    }
    refreshPairs();
  }

  async function toggleFavorite(id, isFavorite) {
    if (session) {
      await toggleFavoriteFlag(session, id, isFavorite);
    } else {
      const list = loadLocalPairs().map((x) => (x.id === id ? { ...x, isFavorite } : x));
      saveLocalPairs(list);
    }
    refreshPairs();
  }

  async function addSaving(item) {
    if (session) {
      await addSavingRemote(session, item);
    } else {
      const list = loadLocalSavings();
      list.push({ id: Date.now(), ...item });
      saveLocalSavings(list);
    }
    refreshSavings();
  }

  async function removeSaving(id) {
    if (session) {
      await removeSavingRemote(session, id);
    } else {
      saveLocalSavings(loadLocalSavings().filter((x) => x.id !== id));
    }
    refreshSavings();
  }

  async function addAlert(item) {
    if (session) {
      await addAlertRemote(session, item);
    } else {
      const list = loadLocalAlerts();
      list.push({ id: Date.now(), isActive: true, ...item });
      saveLocalAlerts(list);
    }
    refreshAlerts();
  }

  async function removeAlert(id) {
    if (session) {
      await removeAlertRemote(session, id);
    } else {
      saveLocalAlerts(loadLocalAlerts().filter((x) => x.id !== id));
    }
    refreshAlerts();
  }

  async function toggleAlert(id, isActive) {
    if (session) {
      await toggleAlertRemote(session, id, isActive);
    } else {
      const list = loadLocalAlerts().map((x) => (x.id === id ? { ...x, isActive } : x));
      saveLocalAlerts(list);
    }
    refreshAlerts();
  }

  function resetLocalData() {
    clearLocalData();
    refreshPairs();
    refreshSavings();
    refreshAlerts();
  }

  return (
    <DataContext.Provider value={{
      pairs, savings, alerts,
      addPair, removePair, toggleFavorite, addSaving, removeSaving, addAlert, removeAlert, toggleAlert,
      resetLocalData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
