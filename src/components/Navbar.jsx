import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar({ navigate, activePage }) {
  const { totalItems, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Home', key: 'home' },
    { label: 'Menu', key: 'menu' },
    { label: 'Track Order', key: 'tracking' },
    { label: 'About', key: 'about' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <div className="logo" onClick={() => navigate('home')}>
          <span className="logo-icon">🔥</span>
          <span className="logo-text">CraveIt</span>
        </div>
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <li key={l.key}>
              <button className={`nav-link ${activePage === l.key ? 'active' : ''}`}
                onClick={() => { navigate(l.key); setMenuOpen(false); }}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            🛒 Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}
