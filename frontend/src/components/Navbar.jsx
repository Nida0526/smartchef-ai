import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Settings, Bookmark, LogOut, MessageSquare, Sparkles, Menu, X } from 'lucide-react';
import { FryingPan } from './ui/KitchenArt';

function getName() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.name || '';
  } catch {
    return '';
  }
}

export default function Navbar({ setToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const name = getName();
  const initials = name ? name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : 'SC';

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  const links = [
    { to: '/', icon: <MessageSquare size={16} />, label: 'Chat' },
    { to: '/generator', icon: <Sparkles size={16} />, label: 'Generator' },
    { to: '/preferences', icon: <Settings size={16} />, label: 'Memory' },
    { to: '/saved', icon: <Bookmark size={16} />, label: 'Saved' }
  ];

  return (
    <nav className="glass-nav">
      <div className="nav-brand">
        <span className="brand-icon"><FryingPan /></span>
        <span className="brand-text">SmartChef<span className="brand-dot">AI</span></span>
      </div>

      <div className={`nav-links ${open ? 'nav-links-open' : ''}`}>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {l.icon}
            <span className="nav-link-label">{l.label}</span>
          </Link>
        ))}
      </div>

      <div className="nav-right">
        <div className="nav-user" title={name || 'Account'}>
          <span className="avatar">{initials}</span>
        </div>
        <button className="nav-logout" onClick={handleLogout} aria-label="Log out">
          <LogOut size={18} />
        </button>
        <button
          className="nav-burger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}