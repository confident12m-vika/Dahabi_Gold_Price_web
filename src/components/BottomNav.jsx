import { NavLink } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

const ITEMS = [
  { path: '/profile', icon: '◍', key: 'nav_profile' },
  { path: '/settings', icon: '⚙', key: 'nav_settings' },
  { path: '/exchange', icon: '$', key: 'nav_exchange' },
  { path: '/calculator', icon: '▦', key: 'nav_calc' },
  { path: '/pairs', icon: '⇌', key: 'nav_pairs' },
  { path: '/', icon: '⌂', key: 'nav_home', end: true },
];

export default function BottomNav() {
  const { t } = useLang();
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}
        >
          <span className="bn-icon">{item.icon}</span>
          <span>{t(item.key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
