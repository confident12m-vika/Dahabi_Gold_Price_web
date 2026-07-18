import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import SideNav from './components/SideNav';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Pairs from './pages/Pairs';
import Calculator from './pages/Calculator';
import Converter from './pages/Converter';
import Masareef from './pages/Masareef';
import Exchange from './pages/Exchange';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Premium from './pages/Premium';
import Onboarding from './pages/Onboarding';
import CurrencySetup from './pages/CurrencySetup';
import { useCurrency } from './contexts/CurrencyContext';
import { useAuth } from './contexts/AuthContext';

const GUEST_KEY = 'dahabi_guest_v1';

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const { baseCurrency, setBaseCurrency } = useCurrency();
  const { session, restoring, needsCurrencySetup } = useAuth();
  const [guestSkipped, setGuestSkipped] = useState(() => localStorage.getItem(GUEST_KEY) === '1');

  // لسه نستعيد الجلسة المحفوظة (لو فيه) — ما نعرض ولا شاشة لحد ما نتأكد
  if (restoring) return null;

  // ما فيه جلسة وما تخطّى كضيف بعد → شاشة الترحيب (دخول/تسجيل/تخطي)
  if (!session && !guestSkipped) {
    return (
      <Onboarding
        onSkip={() => {
          localStorage.setItem(GUEST_KEY, '1');
          setGuestSkipped(true);
        }}
      />
    );
  }

  // فيه جلسة (تسجيل جديد أو جوجل) لكن أول مرة — لازم يختار عملته الأساسية أول
  if (session && needsCurrencySetup) {
    return <CurrencySetup />;
  }

  return (
    <>
      <TopBar baseCurrency={baseCurrency} setBaseCurrency={setBaseCurrency} onHamburger={() => setNavOpen(true)} />
      <SideNav open={navOpen} onClose={() => setNavOpen(false)} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pairs" element={<Pairs />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/converter" element={<Converter />} />
          <Route path="/masareef" element={<Masareef />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/premium" element={<Premium />} />
        </Routes>
      </main>

      <BottomNav />
    </>
  );
}
