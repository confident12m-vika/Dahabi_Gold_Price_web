import { NavLink } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

const ITEMS = [
  { path: '/profile', icon: '◍', key: 'nav_profile' },
  { path: '/', icon: '⌂', key: 'nav_home', end: true },
  { path: '/pairs', icon: '⇌', key: 'nav_pairs' },
  { path: '/calculator', icon: '▦', key: 'nav_calc' },
  { path: '/masareef', icon: '💱', key: 'masareef_title' },
  { path: '/exchange', icon: '$', key: 'nav_exchange' },
  { path: '/alerts', icon: '🔔', key: 'nav_alerts' },
  { path: '/settings', icon: '⚙', key: 'nav_settings' },
];

const FOOTER_ITEMS = [
  { path: '/about', icon: 'ℹ', key: 'nav_about' },
  { path: '/premium', icon: '👑', key: 'nav_premium' },
  { path: '/privacy', icon: '🛡', key: 'nav_privacy' },
];

export default function SideNav({ open, onClose }) {
  const { t } = useLang();

  return (
    <>
      <nav className={`sidenav${open ? ' open' : ''}`}>
        {ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `sidenav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="sn-icon">{item.icon}</span>
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
        <div className="sidenav-divider" />
        {FOOTER_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidenav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="sn-icon">{item.icon}</span>
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>
      <div className={`sidenav-overlay${open ? ' open' : ''}`} onClick={onClose} />
    </>
  );
}
