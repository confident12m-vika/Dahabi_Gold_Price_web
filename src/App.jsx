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
import { useCurrency } from './contexts/CurrencyContext';

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const { baseCurrency, setBaseCurrency } = useCurrency();

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
