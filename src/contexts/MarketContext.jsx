import { createContext, useContext, useState, useEffect } from 'react';
import { fetchMarketData } from '../lib/supabase';

const MarketContext = createContext(null);

export function MarketProvider({ children }) {
  const [marketData, setMarketData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | live | error

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchMarketData();
        if (!cancelled) {
          setMarketData(data);
          setStatus('live');
        }
      } catch (_) {
        if (!cancelled) setStatus('error');
      }
    }

    load();
    const interval = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <MarketContext.Provider value={{ marketData, status }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}
