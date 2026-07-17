import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '#exp', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#edu', label: 'Education' },
  { href: '#ach', label: 'Awards' },
  { href: '#pub', label: 'Research' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar({ scrollDepth }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const depth = Math.round((scrollDepth ?? 0) * 3000);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <a href="#hero" className="nav-logo">GIRI.DEV</a>
      <ul className="nav-links">
        {NAV_ITEMS.map(item => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
      <div className="depth-indicator">
        <span id="depth-text">{depth}m</span>
        <div className="depth-bar">
          <div
            className="depth-fill"
            id="depth-fill"
            style={{ width: (scrollDepth ?? 0) * 100 + '%' }}
          />
        </div>
      </div>
    </nav>
  );
}
