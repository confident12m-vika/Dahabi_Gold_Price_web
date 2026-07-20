import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import SideNav from './components/SideNav';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import GuestHome from './components/GuestHome';
import GuestLocked from './components/GuestLocked';
import Pairs from './pages/Pairs';
import Calculator from './pages/Calculator';
import Converter from './pages/Converter';
import Masareef from './pages/Masareef';
import Exchange from './pages/Exchange';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Privacy from './pages/Privacy';
import DeleteAccountInfo from './pages/DeleteAccountInfo';
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

  // مستخدم سجّل للتو (بريد مؤكّد أو جوجل) ولسه ما اختار عملته الأساسية — نطلبها مرة واحدة بس
  if (session && needsCurrencySetup) {
    return <CurrencySetup />;
  }

  return (
    <>
      <TopBar baseCurrency={baseCurrency} setBaseCurrency={setBaseCurrency} onHamburger={() => setNavOpen(true)} />
      <SideNav open={navOpen} onClose={() => setNavOpen(false)} />

      <main className="app-main">
        <Routes>
          {/* الأسعار — تصميم مختلف تماماً للضيف (جدول عمودي) عن المسجّل (بطاقات/تبويبات) */}
          <Route path="/" element={session ? <Home /> : <GuestHome />} />

          {/* صفحات مفتوحة للجميع بدون أي قيد */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/delete-account" element={<DeleteAccountInfo />} />
          <Route path="/about" element={<About />} />
          <Route path="/premium" element={<Premium />} />

          {/* صفحات مقفلة على الضيف — تظهر له رسالة "سجّل دخول مجاناً" بدل المحتوى الحقيقي */}
          <Route path="/pairs" element={session ? <Pairs /> : <GuestLocked titleKey="nav_pairs" />} />
          <Route path="/calculator" element={session ? <Calculator /> : <GuestLocked titleKey="nav_calc" />} />
          <Route path="/converter" element={session ? <Converter /> : <GuestLocked titleKey="nav_converter" />} />
          <Route path="/masareef" element={session ? <Masareef /> : <GuestLocked titleKey="masareef_title" />} />
          <Route path="/exchange" element={session ? <Exchange /> : <GuestLocked titleKey="nav_exchange" />} />
          <Route path="/alerts" element={session ? <Alerts /> : <GuestLocked titleKey="nav_alerts" />} />
          <Route path="/settings" element={session ? <Settings /> : <GuestLocked titleKey="nav_settings" />} />
        </Routes>
      </main>

      <BottomNav />
    </>
  );
}
