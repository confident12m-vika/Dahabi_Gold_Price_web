import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import SideNav from './components/SideNav';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import GuestHome from './components/GuestHome';
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
import CurrencySetup from './pages/CurrencySetup';
import { useCurrency } from './contexts/CurrencyContext';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const { baseCurrency, setBaseCurrency } = useCurrency();
  const { restoring, session, needsCurrencySetup } = useAuth();

  // لسه نستعيد الجلسة المحفوظة (لو فيه) — لحظة بسيطة قبل ما نعرف هل فيه مستخدم مسجّل
  if (restoring) return null;

  // الاستثناء الوحيد: مستخدم سجّل للتو (بريد مؤكّد أو جوجل) ولسه ما اختار عملته
  // الأساسية — نطلبها منه مرة واحدة بس قبل ما يدخل التطبيق. أي زائر ضيف يتخطى
  // هذا تماماً ويشوف الأسعار مباشرة.
  if (session && needsCurrencySetup) {
    return <CurrencySetup />;
  }

  return (
    <>
      <TopBar baseCurrency={baseCurrency} setBaseCurrency={setBaseCurrency} onHamburger={() => setNavOpen(true)} />
      <SideNav open={navOpen} onClose={() => setNavOpen(false)} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={session ? <Home /> : <GuestHome />} />
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
