import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ navigate, activePage }) {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { label: 'Home', key: 'home' },
    { label: 'Menu', key: 'menu' },
    { label: 'Track Order', key: 'tracking' },
    { label: 'About', key: 'about' },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('home');
  };

  // Get initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Logo */}
        <div className="logo" onClick={() => navigate('home')}>
          <span className="logo-icon">🔥</span>
          <span className="logo-text">CraveIt</span>
        </div>

        {/* Links */}
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <li key={l.key}>
              <button
                className={`nav-link ${activePage === l.key ? 'active' : ''}`}
                onClick={() => { navigate(l.key); setMenuOpen(false); }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          {/* Cart */}
          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            🛒 Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {/* User area */}
          {isLoggedIn ? (
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button className="user-avatar-btn" onClick={() => setUserMenuOpen(o => !o)}>
                <span className="user-initials">{initials}</span>
                <span className="user-name-nav">{user.name.split(' ')[0]}</span>
                <span className="user-caret">{userMenuOpen ? '▲' : '▼'}</span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">{initials}</div>
                    <div>
                      <p className="user-dropdown-name">{user.name}</p>
                      <p className="user-dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item" onClick={() => { navigate('tracking'); setUserMenuOpen(false); }}>
                    📦 My Orders
                  </button>
                  <button className="user-dropdown-item" onClick={() => { navigate('menu'); setUserMenuOpen(false); }}>
                    🍔 Browse Menu
                  </button>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item logout" onClick={handleLogout}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-nav-btns">
              <button className="nav-login-btn" onClick={() => navigate('login')}>Sign In</button>
              <button className="nav-signup-btn" onClick={() => navigate('signup')}>Sign Up</button>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}
